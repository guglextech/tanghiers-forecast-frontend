'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLockup } from '@/components/brand/Logo';
import { useSession } from '@/components/app/SessionProvider';
import { ApiError } from '@/lib/api/errors';
import { mfaPathFor, readPendingMfa } from '@/lib/mfa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shellClass } from '@/components/chrome/Chrome';
import { cn } from '@/lib/utils';

type Step = 'choose' | 'password';

const choiceClass =
  'inline-flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius)] text-sm font-medium transition-colors';

export function AuthForm() {
  const { user, ready, login, continueWithGoogle } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';

  const [step, setStep] = useState<Step>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'google' | 'password' | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(destinationFor(user.role, next));
  }, [ready, user, next, router]);

  const go = (sessionRole: 'member' | 'admin') => {
    router.replace(destinationFor(sessionRole, next));
  };

  const onGoogle = async () => {
    setError('');
    setBusy('google');
    try {
      const session = await continueWithGoogle();
      toast.success('Signed in with Google.');
      go(session.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue with Google.');
      setBusy(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy('password');
    try {
      const session = await login({ email, password });
      go(session.role);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'PENDING_VERIFICATION') {
        toast.success(err.message);
        setError(err.message);
        setBusy(null);
        return;
      }
      if (err instanceof ApiError && (err.code === 'MFA_ENROLL' || err.code === 'MFA_VERIFY')) {
        router.replace(mfaPathFor(readPendingMfa(), next));
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not continue.');
      setBusy(null);
    }
  };

  const query = next ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header>
        <div className={cn(shellClass, 'flex h-12 items-center md:h-16')}>
          <BrandLockup />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <h1 className="text-[1.75rem] font-semibold tracking-tight">
          Log in
        </h1>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          Continue with Google, or use email and password.
        </p>

        {step === 'choose' ? (
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={onGoogle}
              disabled={busy === 'google'}
              className={cn(choiceClass, 'border border-input bg-background text-foreground hover:bg-muted disabled:opacity-60')}
            >
              {busy === 'google' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <GoogleMark />}
              {busy === 'google' ? 'Logging in' : 'Continue with Google'}
            </button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep('password');
              }}
              className={cn(choiceClass, 'bg-primary text-primary-foreground hover:bg-[#262626]')}
            >
              Username & password
            </button>
            {error ? <p className="pt-1 text-sm text-destructive">{error}</p> : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <button
              type="button"
              className="text-sm font-medium text-[#667085] hover:text-[#101828]"
              onClick={() => {
                setError('');
                setShowPassword(false);
                setStep('choose');
              }}
            >
              Back
            </button>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  minLength={6}
                  placeholder="••••••••"
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
                  {showPassword ? <EyeOff className="size-4" strokeWidth={1.75} /> : <Eye className="size-4" strokeWidth={1.75} />}
                </button>
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" loading={busy === 'password'}>
              {busy === 'password' ? 'Logging in' : 'Log in'}
            </Button>
            <p className="text-center text-sm">
              <Link
                href={email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : '/forgot-password'}
                className="font-medium text-[#667085] hover:text-[#101828]"
              >
                Forgot password?
              </Link>
            </p>
          </form>
        )}

        <p className="mt-6 text-sm text-[#667085]">
          New here?{' '}
          <Link href={`/signup${query}`} className="font-medium text-[#101828] hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}

export function GoogleMark() {
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

function destinationFor(role: 'member' | 'admin', next: string) {
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  if (role === 'admin') return '/admin';
  return '/feed';
}
