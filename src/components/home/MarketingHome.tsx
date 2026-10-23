'use client';

import Link from 'next/link';
import { PlanCards } from '@/components/billing/Plans';
import { LoadingState } from '@/components/app/LoadingState';
import { PublicFrame } from '@/components/chrome/Frames';
import { ForecastPost } from '@/components/forecast/ForecastArticle';
import { useDesk } from '@/components/forecast/useDesk';
import { latestPublished } from '@/data/forecasts';
import { SITE } from '@/data/site';

const points = [
  {
    title: 'One forecast a day',
    body: 'The desk publishes the numbers and the draw. The current post stays closed until a plan is active.',
  },
  {
    title: 'Site, email, and SMS',
    body: 'Active subscribers see the same forecast on the site, and delivery is sent by email and text.',
  },
  {
    title: 'Pay online',
    body: 'Plans are billed in USD with Stripe. No short code, USSD, or mobile money.',
  },
];

export function MarketingHome() {
  const desk = useDesk();
  const latest = desk ? latestPublished(desk.forecasts) : null;

  return (
    <PublicFrame>
      <header className="pb-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Daily forecasts</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">{SITE.tagline}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/signup?next=/pricing"
            className="inline-flex h-9 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white hover:bg-[#1d2939]"
          >
            Subscribe
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-[#101828] hover:underline">
            See plans
          </Link>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[#101828]">Today</h2>
        {!desk ? (
          <LoadingState compact label="Loading today’s forecast…" className="min-h-0 justify-start px-0" />
        ) : latest ? (
          <div className="mt-3">
            <ForecastPost forecast={latest} locked subscribeHref="/signup?next=/pricing" />
          </div>
        ) : (
          <div className="mt-3 rounded-2xl bg-[#f4f6f8] px-5 py-6">
            <p className="text-sm font-semibold text-[#101828]">Nothing published yet</p>
            <p className="mt-1 text-sm leading-6 text-[#667085]">
              When the desk publishes, subscribers open the numbers and the draw here.
            </p>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[#101828]">Plans</h2>
        <p className="mt-1 text-sm text-[#98a2b3]">One plan opens the forecast. Billed in USD.</p>
        <div className="mt-4">
          <PlanCards mode="public" />
        </div>
      </section>

      <div className="mt-10 space-y-6">
        {points.map((point) => (
          <section key={point.title}>
            <h2 className="text-sm font-semibold text-[#101828]">{point.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#98a2b3]">{point.body}</p>
          </section>
        ))}
      </div>
    </PublicFrame>
  );
}
