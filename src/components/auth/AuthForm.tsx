'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { BrandLockup } from '@/components/brand/Logo';
import { useSession } from '@/components/app/SessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shellClass } from '@/components/chrome/Chrome';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'signup';
type Step = 'choose' | 'password';

const fieldClass = 'h-12 rounded-xl border-[#d0d5dd] bg-white px-3.5';
const choiceClass =
  'inline-flex h-12 w-full items-center justify-center gap-3 rounded-full text-sm font-semibold transition-colors';

export function AuthForm({ mode }: { mode: Mode }) {
  const { user, ready, login, signup, continueWithGoogle } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';

  const [step, setStep] = useState<Step>('choose');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(destinationFor(user.role, next, mode));
  }, [ready, user, next, router, mode]);

  useEffect(() => {
    setStep('choose');
    setError('');
  }, [mode]);

  const go = (sessionRole: 'member' | 'admin') => {
    router.replace(destinationFor(sessionRole, next, mode));
  };

  const onGoogle = () => {
    setError('');
    try {
      const session = continueWithGoogle();
      toast.success('Signed in with Google.');
      go(session.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue with Google.');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const session =
        mode === 'signup' ? signup({ name, email, password }) : login({ email, password });
      go(session.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue.');
    }
  };

  const query = next ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#e6e8ee]">
        <div className={cn(shellClass, 'flex h-12 items-center md:h-16')}>
          <BrandLockup />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <h1 className="text-[1.75rem] font-semibold tracking-tight">
          {mode === 'login' ? 'Log in' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          Continue with Google, or use a username and password.
        </p>

        {step === 'choose' ? (
          <div className="mt-8 space-y-3">
            <button type="button" onClick={onGoogle} className={cn(choiceClass, 'border border-[#d0d5dd] bg-white text-[#101828] hover:bg-[#f7f8fa]')}>
              <GoogleMark />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep('password');
              }}
              className={cn(choiceClass, 'bg-[#101828] text-white hover:bg-[#1d2939]')}
            >
              Username & password
            </button>
            {error ? <p className="pt-1 text-sm text-[#b42318]">{error}</p> : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <button
              type="button"
              className="text-sm font-medium text-[#667085] hover:text-[#101828]"
              onClick={() => {
                setError('');
                setStep('choose');
              }}
            >
              Back
            </button>
            {mode === 'signup' ? (
              <div className="space-y-2">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="name"
                  autoComplete="username"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClass}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClass}
              />
            </div>
            {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
            <Button type="submit" className="h-12 w-full">
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-sm text-[#667085]">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <Link href={`/signup${query}`} className="font-medium text-[#101828] hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href={`/login${query}`} className="font-medium text-[#101828] hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function destinationFor(role: 'member' | 'admin', next: string, mode: Mode) {
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  if (role === 'admin') return '/admin';
  if (mode === 'signup') return '/pricing';
  return '/feed';
}
