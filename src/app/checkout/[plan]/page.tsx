import type { Metadata } from 'next';
import { RequireAuth } from '@/components/app/RequireAuth';
import { CheckoutStart } from '@/components/billing/CheckoutStart';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ plan: string }>;
}) {
  const { plan } = await params;

  return (
    <RequireAuth>
      <CheckoutStart plan={plan} />
    </RequireAuth>
  );
}
