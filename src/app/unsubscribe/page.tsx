import type { Metadata } from 'next';
import { Suspense } from 'react';
import { UnsubscribeScreen } from '@/components/auth/TokenScreens';
import { LoadingState } from '@/components/app/LoadingState';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <UnsubscribeScreen />
    </Suspense>
  );
}
