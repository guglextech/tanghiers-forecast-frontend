'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Copy, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLockup } from '@/components/brand/Logo';
import { useSession } from '@/components/app/SessionProvider';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { shellClass } from '@/components/chrome/Chrome';
import { fetchMfaChallenge, formatSecret, mfaPathFor, readPendingMfa, type MfaChallenge } from '@/lib/mfa';
import { cn } from '@/lib/utils';

function AuthShell({
  title,
  description,
  children,
  wide = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#e6e8ee]">
        <div className={cn(shellClass, 'flex h-12 items-center md:h-16')}>
          <BrandLockup />
        </div>
      </header>
      <main
        className={cn(
          'mx-auto flex w-full flex-1 flex-col justify-center px-4 py-12',
          wide ? 'max-w-lg' : 'max-w-md',
        )}
      >
        <h1 className="text-[1.75rem] font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm leading-6 text-[#667085]">{description}</p>
        {children}
      </main>
    </div>
  );
}

function OtpField({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      disabled={disabled}
      autoFocus
      inputMode="numeric"
      containerClassName="flex w-full justify-center"
    >
      <InputOTPGroup className="gap-2.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className="h-9 w-9 rounded-md text-sm font-medium shadow-none sm:w-10"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied.`);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#667085] hover:text-[#101828]"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function destination(next: string, role: 'member' | 'admin') {
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  return role === 'admin' ? '/admin' : '/feed';
}

export function MfaVerifyScreen() {
  const { user, ready, verifyMfa } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    if (!ready) return;
    if (user) {
      router.replace(destination(next, user.role));
      return;
    }
    const pending = readPendingMfa();
    if (!pending) {
      router.replace('/login');
      return;
    }
    if (pending.enrollmentRequired) {
      router.replace(mfaPathFor(pending, next));
      return;
    }
    setAllowed(true);
  }, [ready, user, next, router]);

  const submit = async (value: string) => {
    if (busy || value.length < 6) return;
    setBusy(true);
    setError('');
    try {
      const session = await verifyMfa(value);
      toast.success('Signed in.');
      router.replace(destination(next, session.role));
    } catch (err) {
      setCode('');
      setError(err instanceof Error ? err.message : 'That code did not match.');
      setBusy(false);
    }
  };

  if (!allowed) {
    return (
      <AuthShell title="Authenticator code" description="Checking your sign-in…">
        <div className="mt-8 h-12 animate-pulse rounded-xl bg-[#f7f8fa]" />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Authenticator code" description="Open your authenticator app and enter the 6-digit code for Tanghiers.">
      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(code);
        }}
      >
        <OtpField value={code} onChange={setCode} onComplete={(value) => void submit(value)} disabled={busy} />
        {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
        <Button type="submit" className="h-12 w-full" disabled={busy || code.length !== 6}>
          {busy ? 'Checking…' : 'Continue'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-[#667085]">
        <Link href="/login" className="font-medium text-[#101828] hover:underline">
          Use a different account
        </Link>
      </p>
    </AuthShell>
  );
}

export function MfaSetupScreen() {
  const { user, ready, confirmMfaSetup } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';
  const [challenge, setChallenge] = React.useState<MfaChallenge | null>(null);
  const [loadError, setLoadError] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(null);
  const [retry, setRetry] = React.useState(0);
  const holdRedirect = Boolean(recoveryCodes);

  React.useEffect(() => {
    if (!ready) return;
    if (user && !holdRedirect) {
      router.replace(destination(next, user.role));
      return;
    }
    const pending = readPendingMfa();
    if (!pending) {
      if (!user) router.replace('/login');
      return;
    }
    if (!pending.enrollmentRequired) {
      router.replace(mfaPathFor(pending, next));
      return;
    }
    let cancelled = false;
    setLoadError('');
    void fetchMfaChallenge()
      .then((nextChallenge) => {
        if (!cancelled) setChallenge(nextChallenge);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not start authenticator setup.');
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user, holdRedirect, next, router, retry]);

  const submit = async (value: string) => {
    if (busy || value.length < 6) return;
    setBusy(true);
    setError('');
    try {
      const result = await confirmMfaSetup(value);
      if (result.recoveryCodes.length > 0) {
        setRecoveryCodes(result.recoveryCodes);
        setBusy(false);
        return;
      }
      toast.success('Authenticator is ready.');
      router.replace(destination(next, result.user.role));
    } catch (err) {
      setCode('');
      setError(err instanceof Error ? err.message : 'That code did not match.');
      setBusy(false);
    }
  };

  if (recoveryCodes) {
    return (
      <AuthShell
        wide
        title="Save your recovery codes"
        description="These codes are shown once. Store them offline. Each one can sign you in if you lose your authenticator."
      >
        <RecoveryCodesPanel
          codes={recoveryCodes}
          onContinue={() => {
            toast.success('Authenticator is ready.');
            router.replace(destination(next, user?.role ?? 'admin'));
          }}
        />
      </AuthShell>
    );
  }

  if (loadError) {
    return (
      <AuthShell title="Authenticator setup" description={loadError}>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            className="text-sm font-medium text-[#101828] hover:underline"
            onClick={() => {
              setChallenge(null);
              setRetry((value) => value + 1);
            }}
          >
            Try again
          </button>
          <Link href="/login" className="text-sm font-medium text-[#667085] hover:text-[#101828] hover:underline">
            Back to log in
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (!challenge) {
    return (
      <AuthShell title="Set up authenticator" description="Preparing a QR code for your authenticator app…">
        <div className="mt-8 h-48 animate-pulse rounded-2xl border border-[#e6e8ee] bg-[#f7f8fa]" />
      </AuthShell>
    );
  }

  const secretDisplay = formatSecret(challenge.secret);

  return (
    <AuthShell
      wide
      title="Set up authenticator"
      description="Scan the code with Google Authenticator, 1Password, or Authy, then enter the 6-digit code it shows."
    >
      <ol className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] font-medium tracking-[0.14em] text-[#98a2b3] uppercase">
        <li className="rounded-full bg-[#101828] px-2 py-1.5 text-white">1 · Scan</li>
        <li className="rounded-full bg-[#f2f4f7] px-2 py-1.5">2 · Confirm</li>
        <li className="rounded-full bg-[#f2f4f7] px-2 py-1.5">3 · Recover</li>
      </ol>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white">
        <div className="flex flex-col items-center gap-5 px-5 py-6 sm:px-8">
          <div className="rounded-2xl border border-[#e6e8ee] bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={challenge.qrCode} alt="Authenticator QR code" width={220} height={220} className="size-[220px]" />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#101828]">Can’t scan?</p>
              {challenge.secret ? <CopyButton value={challenge.secret.replace(/\s+/g, '')} label="Setup key" /> : null}
            </div>
            <p className="mt-1 text-sm leading-6 text-[#667085]">
              Enter this key in your app
              {challenge.email ? ` for ${challenge.email}` : ''}.
            </p>
            {secretDisplay ? (
              <p className="mt-3 break-all rounded-xl bg-[#f7f8fa] px-3 py-3 font-mono text-sm tracking-[0.18em] text-[#101828]">
                {secretDisplay}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <form
        className="mt-6 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(code);
        }}
      >
        <div>
          <p className="text-sm font-semibold text-[#101828]">Verification code</p>
          <p className="mt-1 mb-3 text-sm text-[#667085]">Type the 6-digit code from the app.</p>
          <OtpField value={code} onChange={setCode} onComplete={(value) => void submit(value)} disabled={busy} />
        </div>
        {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
        <Button type="submit" className="h-12 w-full" disabled={busy || code.length !== 6}>
          {busy ? 'Verifying…' : 'Confirm and continue'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-[#667085]">
        <Link href="/login" className="font-medium text-[#101828] hover:underline">
          Use a different account
        </Link>
      </p>
    </AuthShell>
  );
}

function RecoveryCodesPanel({ codes, onContinue }: { codes: string[]; onContinue: () => void }) {
  const download = () => {
    const blob = new Blob([`Tanghiers recovery codes\n\n${codes.join('\n')}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tanghiers-recovery-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
      <ol className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium tracking-[0.14em] text-[#98a2b3] uppercase">
        <li className="rounded-full bg-[#f2f4f7] px-2 py-1.5">1 · Scan</li>
        <li className="rounded-full bg-[#f2f4f7] px-2 py-1.5">2 · Confirm</li>
        <li className="rounded-full bg-[#101828] px-2 py-1.5 text-white">3 · Recover</li>
      </ol>

      <div className="mt-6 rounded-2xl border border-[#e6e8ee] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-[#101828]" />
            <p className="text-sm font-semibold text-[#101828]">Recovery codes</p>
          </div>
          <div className="flex items-center gap-3">
            <CopyButton value={codes.join('\n')} label="Recovery codes" />
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#667085] hover:text-[#101828]"
            >
              <Download className="size-3.5" />
              Download
            </button>
          </div>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {codes.map((item) => (
            <li
              key={item}
              className="rounded-xl bg-[#f7f8fa] px-3 py-2.5 font-mono text-sm tracking-wide text-[#101828]"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Button type="button" className="mt-6 h-12 w-full" onClick={onContinue}>
        I have saved these codes
      </Button>
    </div>
  );
}
