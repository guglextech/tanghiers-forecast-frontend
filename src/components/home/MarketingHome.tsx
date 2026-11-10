'use client';

import * as React from 'react';
import Link from 'next/link';
import { Flame, Lock, Play, Sparkles } from 'lucide-react';
import { PublicFrame } from '@/components/chrome/Frames';
import { Button } from '@/components/ui/button';
import { formatMoney, type Plan } from '@/data/site';
import { getCatalogPlans } from '@/lib/plans';
import { ForecastPoster } from '@/components/home/ForecastPoster';
import { Paywall, checkoutHref } from '@/components/home/Paywall';
import { TEASERS, ago, type Teaser } from '@/components/home/teasers';
import { cn } from '@/lib/utils';

function SectionBar({ icon: Icon, title }: { icon: typeof Flame; title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-[#0B3A82] px-3 py-1.5 text-white">
      <Icon className="size-4" strokeWidth={2} />
      <h2 className="text-sm font-bold tracking-wide uppercase">{title}</h2>
    </div>
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
      <button
        type="button"
        onClick={() => setOpen(feature)}
        className="group relative block w-full overflow-hidden rounded-2xl text-left shadow-[0_12px_32px_rgba(11,58,130,0.18)]"
      >
        <ForecastPoster
          game={feature.game}
          label={feature.label}
          balls={feature.balls}
          tone={feature.tone}
          size="lg"
          badge="Members"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-5 pt-14 pb-4 sm:px-6">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#0B3A82] uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-[#d92d20]" />
            New today
          </span>
          <p className="mt-2 text-lg leading-snug font-bold text-white sm:text-xl">{feature.title}</p>
        </div>
      </button>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#f3f7fd] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#344054]">
          <span className="font-semibold text-[#101828]">Unlock every forecast and video.</span>{' '}
          {leadPrice ? `From ${leadPrice}${lead?.period ? `/${lead.period}` : ''}.` : 'Checkout opens in Stripe.'}
        </p>
        <Button asChild className="h-10 shrink-0 bg-[#0B3A82] px-5 text-white hover:bg-[#092e68]">
          <Link href={checkoutHref(lead?.id)}>Get access</Link>
        </Button>
      </div>

      <section className="mt-8">
        <SectionBar icon={Flame} title="Trending now" />
        <ul className="mt-3 space-y-2.5">
          {trending.map((teaser) => (
            <li key={teaser.id}>
              <button
                type="button"
                onClick={() => setOpen(teaser)}
                className="group flex w-full items-center gap-3 rounded-xl border border-[#e6e8ee] bg-white p-2 text-left transition-colors hover:border-[#c7daf5] hover:bg-[#f8fafc]"
              >
                <ForecastPoster
                  game={teaser.game}
                  label={teaser.label}
                  balls={teaser.balls}
                  tone={teaser.tone}
                  size="sm"
                  className="w-28 shrink-0 rounded-lg sm:w-32"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm leading-snug font-semibold text-[#101828]">
                    {teaser.title}
                  </span>
                  <span className="mt-1 block text-xs text-[#98a2b3]">{ago(teaser.daysAgo)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <SectionBar icon={Play} title="Latest videos" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {latest.map((teaser) => (
            <button
              key={teaser.id}
              type="button"
              onClick={() => setOpen(teaser)}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#e6e8ee] bg-white text-left transition-shadow hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]"
            >
              <ForecastPoster game={teaser.game} label={teaser.label} balls={teaser.balls} tone={teaser.tone} />
              <span className="flex flex-1 flex-col px-3 pt-2.5 pb-3">
                <span className="line-clamp-2 text-sm leading-snug font-semibold text-[#101828]">{teaser.title}</span>
                <span className="mt-auto flex items-center justify-between pt-2 text-xs">
                  <span className="font-medium text-[#0B3A82]">TG Forecasts</span>
                  <span className="text-[#98a2b3]">{ago(teaser.daysAgo)}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-2xl bg-[#0B3A82] px-5 py-6 text-white sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase">
          <Sparkles className="size-3.5" strokeWidth={2} />
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
