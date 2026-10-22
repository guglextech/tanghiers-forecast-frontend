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
import { notifications } from '@/lib/api/resources';
import { resetPasswordToken, verifyEmailToken } from '@/lib/session';

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#e6e8ee]">
        <div className={cn(shellClass, 'flex h-12 items-center md:h-16')}>
          <BrandLockup />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <h1 className="text-[1.75rem] font-semibold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
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

  return (
    <Frame title="Verify email">
      <p className="mt-2 text-sm leading-6 text-[#667085]">{message}</p>
      {status !== 'working' ? (
        <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline">
          Log in
        </Link>
      ) : null}
    </Frame>
  );
}

export function ResetPasswordScreen() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      if (!token) throw new Error('This reset link is missing a token.');
      await resetPasswordToken(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset that password.');
    }
  };

  return (
    <Frame title="Reset password">
      {done ? (
        <>
          <p className="mt-2 text-sm leading-6 text-[#667085]">Your password is updated.</p>
          <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline">
            Log in
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full">
            Save password
          </Button>
        </form>
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
      <p className="mt-2 text-sm leading-6 text-[#667085]">{message}</p>
      {status !== 'working' ? (
        <Link href="/" className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline">
          Back to Tanghiers
        </Link>
      ) : null}
    </Frame>
  );
}
