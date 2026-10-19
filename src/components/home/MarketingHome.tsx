'use client';

import Link from 'next/link';
import { LogoMark } from '@/components/brand/Logo';
import { PublicFrame } from '@/components/chrome/Frames';
import { LoadingState } from '@/components/app/LoadingState';
import { ForecastPost } from '@/components/forecast/ForecastArticle';
import { useDesk } from '@/components/forecast/useDesk';
import { publishedForecasts } from '@/data/forecasts';
import { PLANS, SITE, formatMoney } from '@/data/site';

export function MarketingHome() {
  const desk = useDesk();
  const items = desk ? publishedForecasts(desk.forecasts) : [];

  return (
    <PublicFrame>
      <header className="border-b border-[#eef0f3] pb-4">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Home</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Daily numbers and the machine draw. {SITE.disclaimer}
        </p>
      </header>

      {!desk ? (
        <LoadingState label="Loading the feed…" />
      ) : items.length === 0 ? (
        <p className="py-8 text-sm text-[#667085]">No forecast has been published yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((forecast) => (
            <ForecastPost
              key={forecast.id}
              forecast={forecast}
              locked
              href="/signup?next=/pricing"
            />
          ))}
        </div>
      )}

      <section className="pt-4">
        <div className="flex gap-3">
          <LogoMark className="size-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[#101828]">Plans</p>
            <p className="mt-1 text-sm text-[#667085]">Stripe · USD</p>
            <ul className="mt-3 divide-y divide-[#eef0f3] overflow-hidden rounded-2xl border border-[#e6e8ee]">
              {PLANS.map((plan) => (
                <li
                  key={plan.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-[#101828]">
                    {plan.name}
                    {plan.featured ? (
                      <span className="ml-2 text-[11px] font-medium tracking-[0.12em] text-[#98a2b3] uppercase">
                        Popular
                      </span>
                    ) : null}
                  </span>
                  <span className="tabular-nums text-[#667085]">
                    {formatMoney(plan.price)}/{plan.period}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-3 inline-flex text-sm font-medium text-[#101828] hover:underline"
            >
              See plans
            </Link>
          </div>
        </div>
      </section>
    </PublicFrame>
  );
}
