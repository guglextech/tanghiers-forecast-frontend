'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLockup } from '@/components/brand/Logo';
import { useSession } from '@/components/app/SessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Mode = 'login' | 'signup';

const fieldClass = 'h-12 rounded-xl border-[#d0d5dd] bg-white px-3.5';

export function AuthForm({ mode }: { mode: Mode }) {
  const { user, ready, login, signup } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(destinationFor(user.role, next, mode));
  }, [ready, user, next, router, mode]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const session =
        mode === 'signup' ? signup({ name, email, password }) : login({ email, password });
      router.replace(destinationFor(session.role, next, mode));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#e6e8ee]">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-4 sm:px-6">
          <BrandLockup />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <h1 className="text-[1.75rem] font-semibold tracking-tight">
          {mode === 'login' ? 'Log in' : 'Create your account'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#667085]">
          {mode === 'login'
            ? 'Use the email on your Lotto Forecast account.'
            : 'Then choose a plan. Forecasts open when the subscription is active.'}
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === 'signup' ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
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
          <Button type="submit" className="h-11 w-full">
            {mode === 'login' ? 'Log in' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-[#667085]">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-[#101828] hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already subscribed?{' '}
              <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-[#101828] hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </main>
    </div>
  );
}

function destinationFor(role: 'member' | 'admin', next: string, mode: Mode) {
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  if (role === 'admin') return '/admin';
  if (mode === 'signup') return '/pricing';
  return '/feed';
}
