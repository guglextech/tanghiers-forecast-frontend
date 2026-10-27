import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailFallback, VerifyEmailScreen } from '@/components/auth/TokenScreens';

export const metadata: Metadata = {
  title: 'Verify email',
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailScreen />
    </Suspense>
  );
}
