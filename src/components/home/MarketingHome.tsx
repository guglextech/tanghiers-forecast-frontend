'use client';

import Link from 'next/link';
import { PlanCards } from '@/components/billing/Plans';
import { PublicFrame } from '@/components/chrome/Frames';
import { SITE, homeFaqs } from '@/data/site';
import { latestPublished, SEED_FORECASTS } from '@/data/forecasts';
import { formatForecastDate } from '@/lib/dates';

const steps = [
  {
    title: 'Subscribe online',
    body: 'Create an account and choose a weekly, monthly, or quarterly plan. Stripe handles the recurring payment.',
  },
  {
    title: 'The desk publishes',
    body: 'Each day the forecast and its machine video go live immediately, or at a scheduled time.',
  },
  {
    title: 'You receive it',
    body: 'Active subscribers see it on the site. The same post is sent by email and recorded for SMS.',
  },
];

export function MarketingHome() {
  const sample = latestPublished(SEED_FORECASTS);

  return (
    <PublicFrame>
      <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-medium text-[#667085]">Daily forecasts from {SITE.project}</p>
          <h1 className="mt-3 max-w-xl text-[2rem] font-semibold tracking-tight text-[#101828] sm:text-5xl sm:leading-[1.08]">
            The day’s numbers, delivered with the draw.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#475467]">
            Lotto Forecast publishes one forecast at a time for active subscribers. Read it on the
            site, and receive it by email and SMS. You pay online with Stripe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center rounded-full bg-[#101828] px-5 text-sm font-semibold text-white hover:bg-[#1d2939]"
            >
              See plans
            </Link>
            <Link
              href="/about"
              className="inline-flex h-11 items-center rounded-full border border-[#d0d5dd] px-5 text-sm font-semibold text-[#101828]"
            >
              How it works
            </Link>
          </div>
          <p className="mt-6 text-sm text-[#98a2b3]">{SITE.disclaimer}</p>
        </div>
        {sample ? (
          <aside className="rounded-3xl border border-[#e6e8ee] bg-[#f7f8fa] p-6">
            <p className="text-xs font-medium tracking-[0.14em] text-[#98a2b3]">LATEST FORECAST</p>
            <p className="mt-4 text-[13px] font-medium tracking-[0.12em] text-[#98a2b3]">
              {formatForecastDate(sample.date)}
            </p>
            <div className="mt-4 flex gap-3">
              {sample.numbers.map((number) => (
                <span
                  key={number}
                  className="grid size-[52px] place-items-center rounded-full border-2 border-[#d0d5dd] text-[#d0d5dd]"
                  aria-hidden
                >
                  •
                </span>
              ))}
            </div>
            <p className="mt-5 font-medium">{sample.title}</p>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Numbers and the machine video open with an active subscription.
            </p>
            <Link href="/signup?next=/pricing" className="mt-5 inline-flex text-sm font-semibold hover:underline">
              Subscribe to read it
            </Link>
          </aside>
        ) : null}
      </section>

      <section className="border-y border-[#eef0f3] bg-[#f7f8fa]">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title}>
              <p className="text-sm font-medium text-[#98a2b3]">0{index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#475467]">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Plans</h2>
          <p className="mt-3 text-[15px] leading-7 text-[#475467]">
            Recurring billing in USD through Stripe. No short code, no USSD, and no mobile money.
          </p>
        </div>
        <div className="mt-8">
          <PlanCards mode="public" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight">Questions</h2>
        <div className="mt-6 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
          {homeFaqs.map((item) => (
            <article key={item.question} className="py-5">
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475467]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicFrame>
  );
}
