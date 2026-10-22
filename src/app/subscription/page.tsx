import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { SubscriptionScreen } from '@/components/billing/Plans';
export const metadata: Metadata = {
  title: 'Subscription',
  description: 'Choose or cancel a Tanghiers plan.',
  robots: { index: false, follow: false },
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const highlight = params.plan?.trim().toLowerCase() || null;

  return (
    <AppFrame>
      <SubscriptionScreen highlight={highlight} />
    </AppFrame>
  );
}
