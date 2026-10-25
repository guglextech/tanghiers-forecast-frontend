'use client';

import * as React from 'react';
import Link from 'next/link';
import { LoadingState } from '@/components/app/LoadingState';
import { PublicFrame } from '@/components/chrome/Frames';
import { Button } from '@/components/ui/button';
import { formatMoney, type Plan } from '@/data/site';
import { getCatalogPlans } from '@/lib/plans';

function checkoutHref(planId: string) {
  return `/signup?next=${encodeURIComponent(`/checkout/${planId}`)}`;
}

function AccessCard({ plan }: { plan: Plan }) {
  const amount = typeof plan.price === 'number' ? formatMoney(plan.price, plan.currency) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#f4f6f8]">
      <img
        src="/images/lotto-forecast.jpg"
        alt=""
        className="aspect-[4/3] w-full object-cover"
      />
      <div className="flex flex-1 flex-col px-3 pt-3 pb-3">
        <p className="text-sm font-semibold text-[#101828]">{plan.name}</p>
        <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-[#101828]">
          {amount ?? '—'}
          {amount && plan.period ? (
            <span className="ml-1 text-xs font-medium text-[#98a2b3]">/{plan.period}</span>
          ) : null}
        </p>
        <Button asChild className="mt-3 h-9 w-full" size="sm">
          <Link href={checkoutHref(plan.id)}>Get access</Link>
        </Button>
      </div>
    </article>
  );
}

export function MarketingHome() {
  const [plans, setPlans] = React.useState<Plan[] | null>(null);

  React.useEffect(() => {
    void getCatalogPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  return (
    <PublicFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Daily forecasts</h1>
      <p className="mt-1 text-sm text-[#98a2b3]">Choose a plan. Checkout opens in Stripe.</p>

      {!plans ? (
        <LoadingState compact label="Loading plans…" className="min-h-0 justify-start px-0" />
      ) : plans.length === 0 ? (
        <p className="mt-8 text-sm text-[#667085]">Plans are being updated.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3">
          {plans.map((plan) => (
            <AccessCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </PublicFrame>
  );
}
