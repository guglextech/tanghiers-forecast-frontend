'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BrandLockup } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shellClass } from '@/components/chrome/Chrome';
import { cn } from '@/lib/utils';
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { notifications } from '@/lib/api/resources';
import { forgotPassword, resetPasswordToken, verifyEmailToken } from '@/lib/session';

function Frame({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header>
        <div className={cn(shellClass, 'flex h-12 items-center md:h-16')}>
          <BrandLockup />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        {title ? <h1 className="text-[1.75rem] font-semibold tracking-tight">{title}</h1> : null}
        {children}
      </main>
    </div>
  );
}

function VerifyStatus({
  tone,
  title,
  message,
}: {
  tone: 'working' | 'ok' | 'error';
  title: string;
  message: string;
}) {
  return (
    <>
      <span
        className={cn(
          'grid size-12 place-items-center rounded-full',
          tone === 'ok' && 'bg-[#ecfdf3] text-[#027a48]',
          tone === 'error' && 'bg-[#fef3f2] text-[#b42318]',
          tone === 'working' && 'bg-[#f4f6f8] text-[#667085]',
        )}
        aria-hidden
      >
        {tone === 'ok' ? <Check className="size-5" strokeWidth={2} /> : null}
        {tone === 'error' ? <X className="size-5" strokeWidth={2} /> : null}
        {tone === 'working' ? <Loader2 className="size-5 animate-spin" /> : null}
      </span>
      <h1 className="mt-5 text-[1.75rem] font-semibold tracking-tight text-[#101828]">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[#667085]" role="status">
        {message}
      </p>
      {tone !== 'working' ? (
        <Button asChild className="mt-8 w-full">
          <Link href="/login">Log in</Link>
        </Button>
      ) : null}
    </>
  );
}

export function VerifyEmailScreen() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = React.useState<'working' | 'ok' | 'error'>('working');
  const [message, setMessage] = React.useState('Checking this link…');

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing a token.');
      return;
    }
    void verifyEmailToken(token)
      .then(() => {
        setStatus('ok');
        setMessage('Your email is verified. You can log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Could not verify this email.');
      });
  }, [token]);

  const title =
    status === 'ok' ? 'Email verified' : status === 'error' ? 'Could not verify' : 'Verify email';

  return (
    <Frame>
      <VerifyStatus tone={status} title={title} message={message} />
    </Frame>
  );
}

export function VerifyEmailFallback() {
  return (
    <Frame>
      <VerifyStatus tone="working" title="Verify email" message="Checking this link…" />
    </Frame>
  );
}

export function ForgotPasswordScreen() {
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState(searchParams.get('email') || '');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await forgotPassword(email);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that reset email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame title="Forgot password">
      {done ? (
        <>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            If an account exists for {email.trim().toLowerCase() || 'that address'}, a reset link is on its way.
          </p>
          <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline">
            Back to log in
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Enter your email. If we have an account for it, you’ll get a reset link.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" loading={busy}>
              {busy ? 'Sending' : 'Send reset link'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-[#667085]">
            Remembered it?{' '}
            <Link href="/login" className="font-medium text-[#101828] hover:underline">
              Log in
            </Link>
          </p>
        </>
      )}
    </Frame>
  );
}

export function ResetPasswordScreen() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      if (!token) throw new Error('This reset link is missing a token.');
      await resetPasswordToken(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset that password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame title="Reset password">
      {done ? (
        <>
          <p className="mt-2 text-sm leading-6 text-[#667085]">Your password is updated. You can log in.</p>
          <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline">
            Log in
          </Link>
        </>
      ) : !token ? (
        <>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            This reset link is missing a token. Request a new one from your email.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline"
          >
            Forgot password
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm leading-6 text-[#667085]">Choose a new password for this account.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 grid w-9 place-items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((open) => !open)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" loading={busy}>
              {busy ? 'Saving' : 'Save password'}
            </Button>
          </form>
        </>
      )}
    </Frame>
  );
}

export function UnsubscribeScreen() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = React.useState<'working' | 'ok' | 'error'>('working');
  const [message, setMessage] = React.useState('Updating email preferences…');

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This unsubscribe link is missing a token.');
      return;
    }
    void notifications
      .unsubscribe(token)
      .then(() => {
        setStatus('ok');
        setMessage('You are unsubscribed from forecast emails.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Could not update that preference.');
      });
  }, [token]);

  return (
    <Frame title="Unsubscribe">
      <p className="mt-2 flex items-center gap-2 text-sm leading-6 text-[#667085]">
        {status === 'working' ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
        {message}
      </p>
      {status !== 'working' ? (
        <Link href="/" className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline">
          Back to Tanghiers
        </Link>
      ) : null}
    </Frame>
  );
}
