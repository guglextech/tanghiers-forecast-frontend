import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MfaVerifyScreen } from '@/components/auth/MfaScreens';
import { LoadingState } from '@/components/app/LoadingState';

export const metadata: Metadata = {
  title: 'Authenticator',
  robots: { index: false, follow: false },
};

export default function MfaVerifyPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <MfaVerifyScreen />
    </Suspense>
  );
}
