'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatMoney, planById, type Plan, type PlanId } from '@/data/site';
import { formatLongDate } from '@/lib/dates';
import { getCatalogPlans, planFromList } from '@/lib/plans';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function useCatalogPlans(initial?: Plan[]) {
  const [plans, setPlans] = React.useState<Plan[] | null>(initial ?? null);

  React.useEffect(() => {
    if (initial && initial.length > 0) {
      setPlans(initial);
      return;
    }
    void getCatalogPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, [initial]);

  return plans;
}

export function PlanCards({
  mode,
  highlight,
  plans: initialPlans,
}: {
  mode: 'public' | 'account';
  highlight?: PlanId | null;
  plans?: Plan[];
}) {
  if (mode === 'public') return <PublicPlanCards highlight={highlight} initialPlans={initialPlans} />;
  return <AccountPlanSelector highlight={highlight} />;
}

function PublicPlanCards({
  highlight,
  initialPlans,
}: {
  highlight?: PlanId | null;
  initialPlans?: Plan[];
}) {
  const { user } = useSession();
  const plans = useCatalogPlans(initialPlans);

  if (!plans) return <LoadingState label="Loading plans…" />;

  if (plans.length === 0) {
    return <p className="text-sm text-[#667085]">Plans are being updated. Check back shortly.</p>;
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3',
        plans.length === 2 && 'sm:grid-cols-2',
        plans.length >= 3 && 'sm:grid-cols-3',
      )}
    >
      {plans.map((plan) => {
        const emphasized = highlight === plan.id || (!highlight && plan.featured);
        const href = user
          ? `/subscription?plan=${plan.id}`
          : `/signup?next=${encodeURIComponent(`/subscription?plan=${plan.id}`)}`;
        const channels = (plan.channels ?? []).map((channel) => channel.toUpperCase()).join(' · ');
        return (
          <Link
            key={plan.id}
            href={href}
            className={cn(
              'group flex flex-col rounded-2xl border bg-white p-5',
              'transition duration-300 ease-out',
              'hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(16,24,40,0.35)]',
              emphasized ? 'border-[#101828]' : 'border-[#e6e8ee] hover:border-[#d0d5dd]',
            )}
          >
            <span className="flex min-h-5 items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#101828]">{plan.name}</span>
              {plan.featured ? (
                <span className="rounded-full bg-[#101828] px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-white uppercase">
                  Popular
                </span>
              ) : null}
            </span>
            <span className="mt-4 text-[1.75rem] font-semibold tracking-tight tabular-nums text-[#101828]">
              {formatMoney(plan.price, plan.currency)}
              <span className="text-sm font-medium text-[#667085]">/{plan.period}</span>
            </span>
            <span className="mt-1 text-xs text-[#98a2b3]">{plan.cadence}</span>
            <span className="mt-2 min-h-[2.5rem] text-sm leading-5 text-[#667085]">{plan.blurb}</span>
            {channels ? <span className="mt-3 text-xs font-medium tracking-[0.08em] text-[#98a2b3] uppercase">{channels}</span> : null}
            <span
              className={cn(
                'mt-6 inline-flex h-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
                emphasized
                  ? 'bg-[#101828] text-white group-hover:bg-[#1d2939]'
                  : 'border border-input text-[#101828] group-hover:border-[#101828]',
              )}
            >
              {user ? 'Continue' : 'Get started'}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function AccountPlanSelector({ highlight }: { highlight?: PlanId | null }) {
  const { user, subscribeToPlan } = useSession();
  const router = useRouter();
  const plans = useCatalogPlans();
  const currentId =
    user?.subscriptionStatus === 'active' ? user.planId : null;
  const [selected, setSelected] = React.useState<PlanId>(highlight ?? currentId ?? '');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (highlight) setSelected(highlight);
  }, [highlight]);

  React.useEffect(() => {
    if (selected || !plans?.length) return;
    setSelected(currentId ?? plans[0].id);
  }, [plans, currentId, selected]);

  if (!plans) return <LoadingState label="Loading plans…" />;
  if (plans.length === 0) {
    return <p className="text-sm text-[#667085]">Plans are being updated. Check back shortly.</p>;
  }

  const pending = Boolean(selected) && selected !== currentId;
  const chosen = planFromList(plans, selected) ?? planById(selected);

  const confirm = async () => {
    setError('');
    try {
      await subscribeToPlan(selected);
      toast.success('Continue in checkout to finish.');
      router.push('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start that plan.');
    }
  };

  return (
    <div>
      <div
        className="overflow-hidden rounded-2xl border border-[#e6e8ee]"
        role="radiogroup"
        aria-label="Plans"
      >
        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          const isCurrent = currentId === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(plan.id)}
              className={cn(
                'flex w-full items-center gap-3 border-t border-[#eef0f3] px-4 py-3 text-left first:border-t-0',
                isSelected ? 'bg-[#f7f8fa]' : 'bg-white hover:bg-[#f7f8fa]',
              )}
            >
              <span
                className={cn(
                  'grid size-[18px] shrink-0 place-items-center rounded-full border',
                  isSelected ? 'border-[#101828] bg-[#101828]' : 'border-[#d0d5dd] bg-white',
                )}
                aria-hidden
              >
                {isSelected ? <span className="size-1.5 rounded-full bg-white" /> : null}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-[#101828]">{plan.name}</span>
              <span className="shrink-0 text-right">
                <span className="text-sm font-medium tabular-nums text-[#101828]">
                  {formatMoney(plan.price, plan.currency)}
                  <span className="text-[#667085]">/{plan.period}</span>
                </span>
                {isCurrent ? (
                  <span className="ml-2 text-[11px] font-medium tracking-[0.12em] text-[#98a2b3] uppercase">
                    Current
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {pending && chosen ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#667085]">
            {chosen.name} · {formatMoney(chosen.price, chosen.currency)}/{chosen.period}
          </p>
          <Button type="button" className="h-10 px-5" onClick={confirm}>
            Confirm
          </Button>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-[#b42318]">{error}</p> : null}
    </div>
  );
}

export function SubscriptionScreen({ highlight }: { highlight?: PlanId | null }) {
  const { user, ready, cancelSubscription } = useSession();
  const plans = useCatalogPlans();
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!ready || !user || !plans) return <LoadingState label="Loading subscription…" />;

  const plan = planFromList(plans, user.planId) ?? planById(user.planId);
  const active = user.subscriptionStatus === 'active' && plan;

  const status = active
    ? `${plan.name} · ${formatMoney(plan.price, plan.currency)}/${plan.period} · Renews ${
        user.currentPeriodEnd ? formatLongDate(user.currentPeriodEnd) : 'soon'
      }`
    : user.subscriptionStatus === 'canceled'
      ? 'Canceled'
      : 'No active plan';

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">Subscription</h1>
          <p className="mt-1 text-sm text-[#667085]">{status}</p>
        </div>
        {active ? (
          confirmCancel ? (
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                className="text-sm font-medium text-[#b42318] hover:underline"
                onClick={() => {
                  void (async () => {
                    try {
                      await cancelSubscription();
                      setConfirmCancel(false);
                      toast.success('Continue in the billing portal.');
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Could not cancel.');
                    }
                  })();
                }}
              >
                Confirm cancel
              </button>
              <button
                type="button"
                className="text-sm font-medium text-[#667085] hover:underline"
                onClick={() => setConfirmCancel(false)}
              >
                Keep
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-[#667085] hover:text-[#101828]"
              onClick={() => setConfirmCancel(true)}
            >
              Cancel
            </button>
          )
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}

      <div className="mt-6">
        <AccountPlanSelector highlight={highlight} />
      </div>

      <h2 className="mt-10 text-[15px] font-semibold text-[#101828]">Payments</h2>
      {user.invoices.length === 0 ? (
        <p className="mt-3 text-sm text-[#667085]">No payments yet.</p>
      ) : (
        <ul className="mt-3 overflow-hidden rounded-2xl border border-[#e6e8ee]">
          {user.invoices.map((invoice) => (
            <li
              key={invoice.id}
              className="flex items-center justify-between gap-4 border-t border-[#eef0f3] px-4 py-3 first:border-t-0"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[#101828]">{invoice.label}</span>
                <span className="text-sm text-[#98a2b3]">{formatLongDate(invoice.date)}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-medium tabular-nums">{formatMoney(invoice.amount)}</span>
                <span className="text-[11px] font-medium tracking-[0.12em] text-[#027a48] uppercase">
                  {invoice.status}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
