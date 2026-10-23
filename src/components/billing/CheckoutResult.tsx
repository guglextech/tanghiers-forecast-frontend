'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { useSession } from '@/components/app/SessionProvider';
import { hasForecastAccess } from '@/lib/session';
import { getCatalogPlans, planFromList } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ResultMark({ tone }: { tone: 'ok' | 'wait' | 'bad' }) {
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full',
        tone === 'ok' && 'bg-[#ecfdf3] text-[#027a48]',
        tone === 'wait' && 'bg-[#f2f4f7] text-[#667085]',
        tone === 'bad' && 'bg-[#fef3f2] text-[#b42318]',
      )}
      aria-hidden
    >
      {tone === 'ok' ? <Check className="size-4" strokeWidth={2} /> : null}
      {tone === 'bad' ? <X className="size-4" strokeWidth={2} /> : null}
      {tone === 'wait' ? (
        <span className="size-3.5 animate-spin rounded-full border-2 border-[#d0d5dd] border-t-[#667085]" />
      ) : null}
    </span>
  );
}

function Notice({
  tone,
  title,
  body,
  primary,
  secondary,
}: {
  tone: 'ok' | 'wait' | 'bad';
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  return (
    <section className="max-w-md rounded-2xl border border-[#e6e8ee] p-5">
      <div className="flex items-start gap-3">
        <ResultMark tone={tone} />
        <div className="min-w-0 pt-0.5">
          <h1 className="text-base font-semibold tracking-tight text-[#101828]">{title}</h1>
          <p className="mt-1 text-sm leading-5 text-[#667085]">{body}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={secondary.href}>{secondary.label}</Link>
        </Button>
      </div>
    </section>
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
    <Notice
      tone={confirming ? 'wait' : 'ok'}
      title={title}
      body={body}
      primary={{
        href: signedIn ? '/feed' : `/login?next=${encodeURIComponent('/feed')}`,
        label: signedIn ? 'Open forecast' : 'Log in',
      }}
      secondary={{
        href: signedIn ? '/subscription' : '/pricing',
        label: signedIn ? 'Subscription' : 'See plans',
      }}
    />
  );
}

export function CheckoutFailedScreen() {
  const { user } = useSession();

  return (
    <Notice
      tone="bad"
      title="Payment not completed"
      body="Nothing was charged. You can try the same plan again, or pick a different one."
      primary={{ href: user ? '/subscription' : '/pricing', label: 'Try again' }}
      secondary={{ href: user ? '/feed' : '/', label: 'Back' }}
    />
  );
}
