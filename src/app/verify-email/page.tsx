import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailScreen } from '@/components/auth/TokenScreens';
import { LoadingState } from '@/components/app/LoadingState';

export const metadata: Metadata = {
  title: 'Verify email',
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <VerifyEmailScreen />
    </Suspense>
  );
}
