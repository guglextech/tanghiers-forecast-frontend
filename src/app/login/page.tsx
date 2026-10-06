import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { LoadingState } from '@/components/app/LoadingState';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to Lotto Forecast.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
