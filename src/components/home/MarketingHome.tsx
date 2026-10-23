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

const FORECAST_ROWS = [
  { label: 'Banker', count: 1 },
  { label: 'Two sure', count: 2 },
  { label: 'Three direct', count: 3 },
] as const;

function ForecastPlaceholder() {
  return (
    <div className="bg-[#eef0f3] px-3 py-3" aria-hidden>
      <p className="text-[10px] tracking-wide text-[#98a2b3] uppercase">Today</p>
      <p className="mt-0.5 text-xs font-semibold text-[#101828]">Lotto forecast</p>
      <div className="mt-2.5 space-y-1.5">
        {FORECAST_ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#98a2b3]">{row.label}</span>
            <span className="flex gap-1">
              {Array.from({ length: row.count }).map((_, index) => (
                <span
                  key={index}
                  className="grid size-5 place-items-center rounded-full border border-[#d0d5dd] text-[9px] text-[#c5cad3]"
                >
                  •
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccessCard({ plan }: { plan: Plan }) {
  const amount = typeof plan.price === 'number' ? formatMoney(plan.price, plan.currency) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#f4f6f8]">
      <ForecastPlaceholder />
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
