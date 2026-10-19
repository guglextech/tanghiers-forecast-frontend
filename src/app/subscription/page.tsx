import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { SubscriptionScreen } from '@/components/billing/Plans';
import type { PlanId } from '@/data/site';

export const metadata: Metadata = {
  title: 'Subscription',
  description: 'Choose or cancel a Tanghiers plan.',
  robots: { index: false, follow: false },
};

const PLANS = new Set<PlanId>(['weekly', 'monthly', 'quarterly']);

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const highlight = params.plan && PLANS.has(params.plan as PlanId) ? (params.plan as PlanId) : null;

  return (
    <AppFrame>
      <SubscriptionScreen highlight={highlight} />
    </AppFrame>
  );
}
