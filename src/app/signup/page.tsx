import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { LoadingState } from '@/components/app/LoadingState';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create a Lotto Forecast account.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
