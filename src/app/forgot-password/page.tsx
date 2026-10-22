import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ForgotPasswordScreen } from '@/components/auth/TokenScreens';
import { LoadingState } from '@/components/app/LoadingState';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your Tanghiers password.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <ForgotPasswordScreen />
    </Suspense>
  );
}
