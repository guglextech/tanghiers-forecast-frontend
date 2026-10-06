'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PLANS, formatMoney, planById, type PlanId } from '@/data/site';
import { formatLongDate } from '@/lib/dates';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PlanCards({
  mode,
  highlight,
}: {
  mode: 'public' | 'account';
  highlight?: PlanId | null;
}) {
  const { user, subscribeToPlan } = useSession();
  const router = useRouter();
  const [pending, setPending] = React.useState<PlanId | null>(null);
  const [error, setError] = React.useState('');

  const confirm = () => {
    if (!pending) return;
    setError('');
    try {
      subscribeToPlan(pending);
      setPending(null);
      toast.success('Subscription is active.');
      router.push('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start that plan.');
    }
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const current = mode === 'account' && user?.planId === plan.id && user.subscriptionStatus === 'active';
          const emphasized = plan.featured || highlight === plan.id;
          return (
            <article
              key={plan.id}
              className={cn(
                'flex flex-col rounded-2xl border bg-white p-5',
                emphasized ? 'border-[#101828]' : 'border-[#e6e8ee]',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">{plan.name}</h3>
                {plan.featured ? (
                  <span className="rounded-full bg-[#f4f6f8] px-2.5 py-1 text-xs font-medium text-[#344054]">
                    Most chosen
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {formatMoney(plan.price)}
                <span className="text-base font-medium text-[#667085]">/{plan.period}</span>
              </p>
              <p className="mt-2 text-sm text-[#667085]">{plan.cadence}</p>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#475467]">{plan.blurb}</p>
              {mode === 'public' ? (
                <Link
                  href={
                    user
                      ? `/subscription?plan=${plan.id}`
                      : `/signup?next=${encodeURIComponent(`/subscription?plan=${plan.id}`)}`
                  }
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white hover:bg-[#1d2939]"
                >
                  Choose {plan.name}
                </Link>
              ) : (
                <Button
                  type="button"
                  className="mt-5 h-11"
                  variant={current ? 'outline' : 'default'}
                  disabled={current}
                  onClick={() => setPending(plan.id)}
                >
                  {current ? 'Current plan' : `Choose ${plan.name}`}
                </Button>
              )}
            </article>
          );
        })}
      </div>
      {pending ? (
        <div className="mt-4 rounded-2xl border border-[#e6e8ee] bg-[#f7f8fa] px-5 py-4">
          <p className="text-sm leading-6 text-[#344054]">
            Confirm the {planById(pending)?.name} plan at {formatMoney(planById(pending)?.price ?? 0)}/
            {planById(pending)?.period}. This preview records the subscription as paid. Stripe will
            take the payment when billing is connected.
          </p>
          {error ? <p className="mt-2 text-sm text-[#b42318]">{error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" className="h-10" onClick={confirm}>
              Confirm subscription
            </Button>
            <Button type="button" variant="outline" className="h-10 border-[#d0d5dd]" onClick={() => setPending(null)}>
              Back
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SubscriptionScreen({ highlight }: { highlight?: PlanId | null }) {
  const { user, ready, cancelSubscription } = useSession();
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!ready || !user) return <LoadingState label="Loading subscription…" />;

  const plan = planById(user.planId);
  const active = user.subscriptionStatus === 'active' && plan;

  return (
    <div>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Subscription</h1>
      <p className="mt-2 text-[15px] leading-6 text-[#667085]">
        Choose a plan, review payment status, or cancel. Billing runs through Stripe.
      </p>

      <section className="mt-8 rounded-2xl border border-[#e6e8ee] px-5 py-5">
        <p className="text-sm text-[#667085]">Current status</p>
        {active ? (
          <>
            <p className="mt-2 text-lg font-semibold">{plan.name} plan is active</p>
            <p className="mt-1 text-sm text-[#667085]">
              Renews {user.currentPeriodEnd ? formatLongDate(user.currentPeriodEnd) : 'soon'} ·{' '}
              {formatMoney(plan.price)}/{plan.period}
            </p>
          </>
        ) : (
          <p className="mt-2 text-lg font-semibold">
            {user.subscriptionStatus === 'canceled' ? 'Subscription canceled' : 'No active plan'}
          </p>
        )}
        <p className="mt-3 text-sm leading-6 text-[#667085]">
          Card details are not stored in this preview. A connected Stripe account will own the
          recurring charge, cancellations, and billing events.
        </p>
        {active ? (
          <div className="mt-4">
            {confirmCancel ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-[#d0d5dd]"
                  onClick={() => {
                    try {
                      cancelSubscription();
                      setConfirmCancel(false);
                      toast.success('Subscription canceled.');
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Could not cancel.');
                    }
                  }}
                >
                  Confirm cancel
                </Button>
                <Button type="button" variant="ghost" className="h-10" onClick={() => setConfirmCancel(false)}>
                  Keep plan
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-10 border-[#d0d5dd]"
                onClick={() => setConfirmCancel(true)}
              >
                Cancel subscription
              </Button>
            )}
            {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
          </div>
        ) : null}
      </section>

      <h2 className="mt-10 text-lg font-semibold">Plans</h2>
      <div className="mt-4">
        <PlanCards mode="account" highlight={highlight} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Payments</h2>
      {user.invoices.length === 0 ? (
        <p className="mt-3 text-sm text-[#667085]">No payments yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
          {user.invoices.map((invoice) => (
            <li key={invoice.id} className="flex items-center justify-between gap-4 py-4 text-sm">
              <span>
                <span className="block font-medium text-[#101828]">{invoice.label}</span>
                <span className="text-[#667085]">{formatLongDate(invoice.date)}</span>
              </span>
              <span className="text-right">
                <span className="block font-medium">{formatMoney(invoice.amount)}</span>
                <span className="text-[#027a48]">{invoice.status}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
