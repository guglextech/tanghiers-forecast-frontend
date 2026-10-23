'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { useSession } from '@/components/app/SessionProvider';
import { hasForecastAccess } from '@/lib/session';
import { getCatalogPlans, planFromList } from '@/lib/plans';
import { cn } from '@/lib/utils';

function ResultMark({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        'grid size-10 place-items-center rounded-full',
        ok ? 'bg-[#ecfdf3] text-[#027a48]' : 'bg-[#fef3f2] text-[#b42318]',
      )}
      aria-hidden
    >
      {ok ? <Check className="size-5" strokeWidth={2.25} /> : <X className="size-5" strokeWidth={2.25} />}
    </span>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-full bg-[#101828] px-5 text-sm font-semibold text-white hover:bg-[#1d2939]"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-[#667085] hover:text-[#101828]">
      {children}
    </Link>
  );
}

export function CheckoutSuccessScreen() {
  const { user, ready, refresh } = useSession();
  const [confirming, setConfirming] = React.useState(true);
  const [planName, setPlanName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    const run = async () => {
      let latest = await refresh();
      if (!latest) {
        if (!cancelled) setConfirming(false);
        return;
      }

      for (let i = 0; i < 4 && !cancelled && !hasForecastAccess(latest); i++) {
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        const next = await refresh();
        if (next) latest = next;
      }

      if (cancelled) return;

      if (latest.planId) {
        try {
          const plans = await getCatalogPlans();
          const plan = planFromList(plans, latest.planId);
          setPlanName(plan?.name ?? null);
        } catch {
          setPlanName(null);
        }
      }

      setConfirming(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [ready, refresh]);

  const active = hasForecastAccess(user);
  const signedIn = Boolean(user);

  const title = confirming ? 'Confirming payment' : 'Payment received';
  const body = confirming
    ? 'Checking that Stripe has activated your plan.'
    : active
      ? `${planName ? `${planName} is active.` : 'Your plan is active.'} Today’s forecast is open.`
      : signedIn
        ? 'Stripe is finishing the charge. Access opens in a moment — refresh subscription if it is still locked.'
        : 'Your payment went through. Log in to open the forecast.';

  return (
    <div>
      <ResultMark ok />
      <h1 className="mt-5 text-[1.75rem] font-semibold tracking-tight text-[#101828]">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">{body}</p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <PrimaryLink href={signedIn ? '/feed' : `/login?next=${encodeURIComponent('/feed')}`}>
          {signedIn ? 'Open forecast' : 'Log in'}
        </PrimaryLink>
        <SecondaryLink href={signedIn ? '/subscription' : '/pricing'}>
          {signedIn ? 'Subscription' : 'See plans'}
        </SecondaryLink>
      </div>
    </div>
  );
}

export function CheckoutFailedScreen() {
  const { user } = useSession();

  return (
    <div>
      <ResultMark ok={false} />
      <h1 className="mt-5 text-[1.75rem] font-semibold tracking-tight text-[#101828]">Payment not completed</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
        Nothing was charged. You can try the same plan again, or pick a different one.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <PrimaryLink href={user ? '/subscription' : '/pricing'}>Try again</PrimaryLink>
        <SecondaryLink href={user ? '/feed' : '/'}>Back</SecondaryLink>
      </div>
    </div>
  );
}
