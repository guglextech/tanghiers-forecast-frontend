import type { Metadata } from 'next';
import { AdaptiveFrame } from '@/components/chrome/Frames';
import { CheckoutFailedScreen } from '@/components/billing/CheckoutResult';

export const metadata: Metadata = {
  title: 'Payment not completed',
  robots: { index: false, follow: false },
};

export default function BillingFailedPage() {
  return (
    <AdaptiveFrame>
      <CheckoutFailedScreen />
    </AdaptiveFrame>
  );
}
