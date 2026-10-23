'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { StepBars } from '@/components/auth/StepBars';
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
  kicker,
  align = 'center',
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
  kicker?: string;
  align?: 'center' | 'start';
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
          'mx-auto flex w-full flex-1 flex-col px-4 py-12',
          align === 'start' ? 'justify-start pt-10 md:pt-16' : 'justify-center',
          wide ? 'max-w-lg' : 'max-w-md',
        )}
      >
        {kicker ? (
          <p className="text-[11px] font-medium tracking-[0.16em] text-[#98a2b3] uppercase">{kicker}</p>
        ) : null}
        <h1 className={cn('text-[1.75rem] font-semibold tracking-tight', kicker && 'mt-2')}>{title}</h1>
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
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#e6e8ee] px-3 text-xs font-medium text-[#344054] transition-colors hover:bg-[#f7f8fa]"
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

const SETUP_STEPS = [
  { title: 'Scan', heading: 'Scan the code', description: 'Open your authenticator app and add Tanghiers.' },
  { title: 'Confirm', heading: 'Confirm the code', description: 'Enter the 6-digit code from the app.' },
  { title: 'Save', heading: 'Save your codes', description: 'Store these codes somewhere safe. They are shown once.' },
] as const;

function ScanStep({ challenge, onContinue }: { challenge: MfaChallenge; onContinue: () => void }) {
  const groups = formatSecret(challenge.secret).split(' ').filter(Boolean);

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-[#e6e8ee] bg-white p-5">
        <div className="flex justify-center">
          <div className="rounded-xl bg-[#f7f8fa] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={challenge.qrCode}
              alt="Authenticator QR code"
              width={180}
              height={180}
              className="size-[180px] rounded-lg bg-white"
            />
          </div>
        </div>
        {groups.length > 0 ? (
          <div className="mt-5 border-t border-[#eef0f3] pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#101828]">Setup key</p>
                <p className="mt-0.5 truncate text-xs text-[#98a2b3]">
                  {challenge.email ? `For ${challenge.email}` : 'Enter this if you cannot scan the code.'}
                </p>
              </div>
              <CopyButton value={groups.join('')} label="Setup key" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {groups.map((group, index) => (
                <span
                  key={`${group}-${index}`}
                  className="rounded-md bg-[#f7f8fa] py-1.5 text-center font-mono text-[13px] tracking-wide text-[#101828]"
                >
                  {group}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <Button type="button" className="mt-5 h-11 w-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}

function ConfirmStep({
  code,
  error,
  busy,
  onChange,
  onBack,
  onSubmit,
}: {
  code: string;
  error: string;
  busy: boolean;
  onChange: (value: string) => void;
  onBack: () => void;
  onSubmit: (value: string) => void;
}) {
  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(code);
      }}
    >
      <OtpField value={code} onChange={onChange} onComplete={onSubmit} disabled={busy} />
      {error ? <p className="text-center text-sm text-[#b42318]">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="h-11" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button type="submit" className="h-11 flex-1" disabled={busy || code.length !== 6}>
          {busy ? 'Checking…' : 'Verify'}
        </Button>
      </div>
    </form>
  );
}

function SaveStep({ codes, onContinue }: { codes: string[]; onContinue: () => void }) {
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
      <div className="rounded-2xl border border-[#e6e8ee] p-4">
        <div className="flex items-center justify-end gap-2">
          <CopyButton value={codes.join('\n')} label="Recovery codes" />
          <button
            type="button"
            onClick={download}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#e6e8ee] px-3 text-xs font-medium text-[#344054] transition-colors hover:bg-[#f7f8fa]"
          >
            <Download className="size-3.5" />
            Download
          </button>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {codes.map((item) => (
            <li key={item} className="rounded-lg bg-[#f7f8fa] px-3 py-2.5 text-center font-mono text-sm tracking-wide text-[#101828]">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Button type="button" className="mt-5 h-11 w-full" onClick={onContinue}>
        I have saved these codes
      </Button>
    </div>
  );
}

export function MfaSetupScreen() {
  const { user, ready, confirmMfaSetup } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';
  const [challenge, setChallenge] = React.useState<MfaChallenge | null>(null);
  const [loadError, setLoadError] = React.useState('');
  const [step, setStep] = React.useState(0);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(null);
  const [retry, setRetry] = React.useState(0);
  const holdRedirect = Boolean(recoveryCodes);
  const current = recoveryCodes ? 2 : step;

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

  const finish = (role: 'member' | 'admin') => {
    toast.success('Authenticator is ready.');
    router.replace(destination(next, role));
  };

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
      finish(result.user.role);
    } catch (err) {
      setCode('');
      setError(err instanceof Error ? err.message : 'That code did not match.');
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <AuthShell title="Set up authenticator" description={loadError}>
        <div className="mt-6 flex items-center gap-5">
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
          <Link href="/login" className="text-sm text-[#667085] hover:text-[#101828]">
            Back to log in
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (!challenge) {
    return (
      <AuthShell title="Set up authenticator" description="Preparing your authenticator setup…">
        <div className="mt-8 h-1 animate-pulse rounded-full bg-[#f2f4f7]" />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      kicker="Set up authenticator"
      title={SETUP_STEPS[current].heading}
      description={SETUP_STEPS[current].description}
      align="start"
    >
      <StepBars
        label="Setup progress"
        steps={SETUP_STEPS}
        current={current}
        onSelect={
          current < 2
            ? (index) => {
                setError('');
                setStep(index);
              }
            : undefined
        }
      />
      {current === 0 ? <ScanStep challenge={challenge} onContinue={() => setStep(1)} /> : null}
      {current === 1 ? (
        <ConfirmStep
          code={code}
          error={error}
          busy={busy}
          onChange={setCode}
          onBack={() => {
            setError('');
            setStep(0);
          }}
          onSubmit={(value) => void submit(value)}
        />
      ) : null}
      {current === 2 && recoveryCodes ? (
        <SaveStep codes={recoveryCodes} onContinue={() => finish(user?.role ?? 'admin')} />
      ) : null}
      {current < 2 ? (
        <p className="mt-6 text-center text-sm text-[#98a2b3]">
          <Link href="/login" className="text-[#667085] hover:text-[#101828]">
            Use a different account
          </Link>
        </p>
      ) : null}
    </AuthShell>
  );
}
