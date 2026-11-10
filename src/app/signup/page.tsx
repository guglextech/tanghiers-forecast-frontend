import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignupScreen } from '@/components/auth/SignupScreen';
import { LoadingState } from '@/components/app/LoadingState';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create a Lotto Forecasts account.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <SignupScreen />
    </Suspense>
  );
}
