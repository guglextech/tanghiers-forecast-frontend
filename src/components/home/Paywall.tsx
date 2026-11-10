'use client';

import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatMoney, type Plan } from '@/data/site';
import { ForecastPoster } from '@/components/home/ForecastPoster';
import type { Teaser } from '@/components/home/teasers';
import { cn } from '@/lib/utils';

export function checkoutHref(planId?: string) {
  const next = planId ? `/checkout/${planId}` : '/pricing';
  return `/signup?next=${encodeURIComponent(next)}`;
}

const PERKS = ['Every daily forecast and video', 'Full numbers and permutations', 'Cancel anytime in billing'];

export function Paywall({
  teaser,
  plans,
  onClose,
}: {
  teaser: Teaser | null;
  plans: Plan[] | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(teaser)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto rounded-2xl border-0 p-0 sm:max-w-md [&>[data-slot=dialog-close]]:z-10 [&>[data-slot=dialog-close]]:grid [&>[data-slot=dialog-close]]:size-8 [&>[data-slot=dialog-close]]:place-items-center [&>[data-slot=dialog-close]]:rounded-full [&>[data-slot=dialog-close]]:bg-black/40 [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:opacity-100 [&>[data-slot=dialog-close]]:top-3 [&>[data-slot=dialog-close]]:right-3">
        {teaser ? (
          <>
            <div className="relative">
              <ForecastPoster
                game={teaser.game}
                label={teaser.label}
                balls={teaser.balls}
                tone={teaser.tone}
                image={teaser.image}
                badge="Locked"
                className="!aspect-[16/7]"
              />
              <div className="absolute inset-0 grid place-items-center bg-[#040d22]/40 backdrop-blur-[3px]">
                <span className="grid size-12 place-items-center rounded-full bg-white text-[#0B3A82] shadow-lg">
                  <Lock className="size-5" strokeWidth={2} />
                </span>
              </div>
            </div>

            <div className="px-5 pt-5 pb-5">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0B3A82] uppercase">Members only</p>
              <DialogTitle className="mt-1.5 text-lg leading-snug font-semibold text-[#101828]">
                {teaser.title}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-[#667085]">
                Create an account and pick a plan to watch this and unlock today&apos;s numbers.
              </DialogDescription>

              <ul className="mt-4 space-y-1.5">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-[#344054]">
                    <Check className="size-4 shrink-0 text-[#027a48]" strokeWidth={2.25} />
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2">
                {plans && plans.length > 0 ? (
                  plans.map((plan, index) => {
                    const price = typeof plan.price === 'number' ? formatMoney(plan.price, plan.currency) : null;
                    const primary = plan.featured || (!plans.some((row) => row.featured) && index === 0);
                    return (
                      <Link
                        key={plan.id}
                        href={checkoutHref(plan.id)}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors',
                          primary
                            ? 'bg-[#0B3A82] text-white hover:bg-[#092e68]'
                            : 'bg-[#f2f4f7] text-[#101828] hover:bg-[#e9ecf1]',
                        )}
                      >
                        <span className="text-sm font-semibold">{plan.name}</span>
                        <span className="text-sm font-semibold tabular-nums">
                          {price ?? 'Get access'}
                          {price && plan.period ? (
                            <span className={cn('font-medium', primary ? 'text-white/70' : 'text-[#98a2b3]')}>
                              /{plan.period}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <Button asChild className="h-11 w-full bg-[#0B3A82] text-white hover:bg-[#092e68]">
                    <Link href={checkoutHref()}>Get access</Link>
                  </Button>
                )}
              </div>

              <p className="mt-4 text-center text-sm text-[#667085]">
                Already a member?{' '}
                <Link href="/login?next=%2Ffeed" className="font-medium text-[#101828] hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
