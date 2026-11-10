'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, Lock, Play } from '@/components/ui/icons';
import { shellClass } from '@/components/chrome/Chrome';
import { PublicFrame } from '@/components/chrome/Frames';
import { Button } from '@/components/ui/button';
import { formatMoney, type Plan } from '@/data/site';
import { getCatalogPlans } from '@/lib/plans';
import { ForecastPoster } from '@/components/home/ForecastPoster';
import { Paywall, checkoutHref } from '@/components/home/Paywall';
import { TEASERS, ago, type Teaser } from '@/components/home/teasers';
import { cn } from '@/lib/utils';

const SECTION_TONES = {
  red: 'bg-[#d92d20]',
  blue: 'bg-[#0B3A82]',
  green: 'bg-[#067647]',
} as const;

function SectionBar({
  icon: Icon,
  title,
  tone = 'blue',
}: {
  icon?: typeof Flame;
  title: string;
  tone?: keyof typeof SECTION_TONES;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {Icon ? (
        <span className={cn('grid size-7 place-items-center rounded-lg text-white', SECTION_TONES[tone])}>
          <Icon className="size-4" strokeWidth={2.2} />
        </span>
      ) : null}
      <h2 className="text-sm font-extrabold tracking-wide text-[#101828] uppercase">{title}</h2>
      <span className="h-px flex-1 bg-[#e4e7ec]" />
    </div>
  );
}

function Hero({ href, onPreview }: { href: string; onPreview: () => void }) {
  return (
    <section className="relative -mt-6 ml-[calc(50%-50vw)] min-h-[34rem] w-screen overflow-hidden bg-[#040d22] text-white md:-mt-10 sm:min-h-[42rem]">
      <Image src="/home/machine.jpg" alt="" fill priority sizes="100vw" className="object-cover object-right" />
      <div className="absolute inset-0 bg-[#040d22]/60" />
      <div
        className={cn(
          shellClass,
          'relative flex min-h-[34rem] flex-col items-center justify-center py-14 text-center sm:min-h-[42rem]',
        )}
      >
        <h1 className="text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-5xl">
          Stop Leaving Millions to <span className="text-[#FB11A8]">Pure Luck</span>
        </h1>
        <p className="mt-4 text-base font-medium text-white/90 sm:text-lg">
          Play numbers selected with an edge, not just hope.
        </p>
        <p className="mt-1.5 text-sm text-white/65">
          You never know when you&apos;ll hit it big. Make sure you&apos;re ready.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="size-9 rounded-full bg-white shadow-[inset_0_-4px_8px_rgba(16,24,40,0.12),0_4px_10px_rgba(0,0,0,0.25)] sm:size-12"
            />
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild className="h-11 bg-[#facc15] px-6 text-sm font-bold text-[#422006] hover:bg-[#eab308]">
            <Link href={href}>
              <Lock className="size-4" strokeWidth={2.4} />
              Get access
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onPreview}
            className="h-11 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20 hover:text-white"
          >
            <Play className="size-4" strokeWidth={2.4} />
            Watch today&apos;s forecast
          </Button>
        </div>
      </div>
    </section>
  );
}

export function MarketingHome() {
  const [plans, setPlans] = React.useState<Plan[] | null>(null);
  const [open, setOpen] = React.useState<Teaser | null>(null);

  React.useEffect(() => {
    void getCatalogPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  const [feature, ...rest] = TEASERS;
  const trending = rest.slice(0, 3);
  const latest = rest.slice(3);
  const lead = plans?.find((plan) => plan.featured) ?? plans?.[0];
  const leadPrice = lead && typeof lead.price === 'number' ? formatMoney(lead.price, lead.currency) : null;

  return (
    <PublicFrame>
      <Hero href={checkoutHref(lead?.id)} onPreview={() => setOpen(feature)} />

      <section className="mt-7">
        <SectionBar title="Featured forecast" />
        <button
          type="button"
          onClick={() => setOpen(feature)}
          className="group relative mt-3 block w-full overflow-hidden rounded-2xl text-left shadow-[0_12px_32px_rgba(11,58,130,0.18)]"
        >
          <ForecastPoster
            game={feature.game}
            label={feature.label}
            balls={feature.balls}
            tone={feature.tone}
            image={feature.image}
            priority
            size="lg"
            badge="Members"
          />
          <div className="absolute inset-x-0 bottom-0 bg-[#040d22]/75 px-5 pt-3 pb-4 sm:px-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#0B3A82] uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-[#d92d20]" />
              New today
            </span>
            <p className="mt-2 text-lg leading-snug font-bold text-white sm:text-xl">{feature.title}</p>
          </div>
        </button>
      </section>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#e4e7ec] bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#344054]">
          <span className="font-semibold text-[#101828]">Unlock every forecast and video.</span>{' '}
          {leadPrice ? `From ${leadPrice}${lead?.period ? `/${lead.period}` : ''}.` : 'Checkout opens in Stripe.'}
        </p>
        <Button asChild className="h-10 shrink-0 bg-[#0B3A82] px-5 text-white hover:bg-[#092e68]">
          <Link href={checkoutHref(lead?.id)}>Get access</Link>
        </Button>
      </div>

      <section className="mt-8">
        <SectionBar title="Trending now" />
        <ul className="mt-3 space-y-2.5">
          {trending.map((teaser) => (
            <li key={teaser.id}>
              <button
                type="button"
                onClick={() => setOpen(teaser)}
                className="group flex w-full items-center gap-3 rounded-xl border border-[#e4e7ec] bg-white p-2 text-left shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-colors hover:border-[#fecdca] hover:bg-[#fffbfa]"
              >
                <ForecastPoster
                  game={teaser.game}
                  label={teaser.label}
                  balls={teaser.balls}
                  tone={teaser.tone}
                  image={teaser.image}
                  size="sm"
                  className="w-28 shrink-0 rounded-lg sm:w-32"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm leading-snug font-semibold text-[#101828]">{teaser.title}</span>
                  <span className="mt-1 block text-xs text-[#98a2b3]">{ago(teaser.daysAgo)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <SectionBar icon={Play} title="Latest videos" tone="green" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {latest.map((teaser) => (
            <button
              key={teaser.id}
              type="button"
              onClick={() => setOpen(teaser)}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#e6e8ee] bg-white text-left transition-shadow hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]"
            >
              <ForecastPoster
                game={teaser.game}
                label={teaser.label}
                balls={teaser.balls}
                tone={teaser.tone}
                image={teaser.image}
              />
              <span className="flex flex-1 flex-col px-3 pt-2.5 pb-3">
                <span className="line-clamp-2 text-sm leading-snug font-semibold text-[#101828]">{teaser.title}</span>
                <span className="mt-auto pt-2 text-xs text-[#98a2b3]">{ago(teaser.daysAgo)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-2xl bg-[#0B3A82] px-5 py-6 text-white sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase">
          Membership
        </span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">See the numbers behind every video</h2>
        <p className="mt-1.5 text-sm text-white/70">Pick a plan, check out with Stripe, and watch right away.</p>

        {plans && plans.length > 0 ? (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {plans.map((plan) => {
              const price = typeof plan.price === 'number' ? formatMoney(plan.price, plan.currency) : null;
              const primary = plan.id === lead?.id;
              return (
                <Link
                  key={plan.id}
                  href={checkoutHref(plan.id)}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition-colors',
                    primary ? 'bg-white text-[#0B3A82] hover:bg-[#eef4fc]' : 'bg-white/10 hover:bg-white/15',
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold">{plan.name}</span>
                    {plan.cadence ? (
                      <span className={cn('block text-xs', primary ? 'text-[#475467]' : 'text-white/60')}>
                        {plan.cadence}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-base font-semibold tabular-nums">
                    {price ?? '—'}
                    {price && plan.period ? (
                      <span className={cn('text-xs font-medium', primary ? 'text-[#98a2b3]' : 'text-white/60')}>
                        /{plan.period}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <Button asChild className="mt-5 h-10 bg-white px-5 text-[#0B3A82] hover:bg-[#eef4fc]">
            <Link href={checkoutHref()}>
              <Lock className="size-4" strokeWidth={2} />
              Get access
            </Link>
          </Button>
        )}
      </section>

      <Paywall teaser={open} plans={plans} onClose={() => setOpen(null)} />
    </PublicFrame>
  );
}
