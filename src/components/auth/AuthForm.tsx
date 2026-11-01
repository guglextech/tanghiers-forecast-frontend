'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLockup } from '@/components/brand/Logo';
import { GoogleContinueButton } from '@/components/auth/GoogleContinueButton';
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
  const query = next ? `?next=${encodeURIComponent(next)}` : '';

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

  const onGoogle = async (idToken: string) => {
    setError('');
    setBusy('google');
    try {
      const session = await continueWithGoogle(idToken);
      toast.success('Signed in with Google.');
      go(session.role);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SOCIAL_SIGNUP') {
        router.replace(`/signup${query}`);
        return;
      }
      if (err instanceof ApiError && (err.code === 'MFA_ENROLL' || err.code === 'MFA_VERIFY')) {
        router.replace(mfaPathFor(readPendingMfa(), next));
        return;
      }
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
            <GoogleContinueButton
              onSuccess={(idToken) => void onGoogle(idToken)}
              onError={setError}
            />
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

function destinationFor(role: 'member' | 'admin', next: string) {
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  if (role === 'admin') return '/admin';
  return '/feed';
}
