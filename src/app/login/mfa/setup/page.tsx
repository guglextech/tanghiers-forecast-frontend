import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MfaSetupScreen } from '@/components/auth/MfaScreens';
import { LoadingState } from '@/components/app/LoadingState';

export const metadata: Metadata = {
  title: 'Set up authenticator',
  robots: { index: false, follow: false },
};

export default function MfaSetupPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <MfaSetupScreen />
    </Suspense>
  );
}
