import type { Metadata } from 'next';
import { AdaptiveFrame } from '@/components/chrome/Frames';
import { CheckoutSuccessScreen } from '@/components/billing/CheckoutResult';

export const metadata: Metadata = {
  title: 'Payment received',
  robots: { index: false, follow: false },
};

export default function BillingSuccessPage() {
  return (
    <AdaptiveFrame>
      <CheckoutSuccessScreen />
    </AdaptiveFrame>
  );
}
