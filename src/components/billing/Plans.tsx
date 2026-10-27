'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatMoney, formatPlanPrice, type Plan, type PlanId } from '@/data/site';
import { formatLongDate } from '@/lib/dates';
import { PRODUCT_SLUG } from '@/lib/api/config';
import { mapAccountPayment, mapAccountSubscription, type AccountPayment, type AccountSubscription } from '@/lib/api/mappers';
import { asList, me } from '@/lib/api/resources';
import type { ApiPayment, ApiSubscription } from '@/lib/api/types';
import { getCatalogPlans, planFromList } from '@/lib/plans';
import { useSession } from '@/components/app/SessionProvider';
import { ConfirmDrawer } from '@/components/admin/ConfirmDrawer';
import { LoadingState } from '@/components/app/LoadingState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function useCatalogPlans(initial?: Plan[]) {
  const [plans, setPlans] = React.useState<Plan[] | null>(initial && initial.length > 0 ? initial : null);

  React.useEffect(() => {
    void getCatalogPlans()
      .then(setPlans)
      .catch(() => setPlans((current) => current ?? []));
  }, []);

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
    <div className="space-y-3">
      {plans.map((plan, index) => {
        const emphasized = highlight === plan.id || (!highlight && (plan.featured || index === 0));
        const href = user
          ? `/subscription?plan=${plan.id}`
          : `/signup?next=${encodeURIComponent(`/subscription?plan=${plan.id}`)}`;
        return (
          <Link
            key={plan.id}
            href={href}
            className="flex flex-col gap-4 rounded-[28px] bg-[#f4f6f8] px-5 py-5 transition-colors hover:bg-[#eef0f3] sm:flex-row sm:items-center"
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[#101828]">{plan.name}</span>
                {plan.featured ? (
                  <span className="rounded-full bg-[#e8f1ff] px-2.5 py-0.5 text-xs font-medium text-[#2e90fa]">
                    Popular
                  </span>
                ) : null}
              </span>
              {plan.blurb ? (
                <span className="mt-1 block text-sm leading-5 text-[#98a2b3]">{plan.blurb}</span>
              ) : null}
            </span>
            <span className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
              {typeof plan.price === 'number' ? (
                <span className="text-[1.25rem] font-semibold tracking-tight tabular-nums text-[#101828]">
                  {formatMoney(plan.price, plan.currency)}
                  {plan.period ? (
                    <span className="text-sm font-medium text-[#98a2b3]">/{plan.period}</span>
                  ) : null}
                </span>
              ) : (
                <span className="text-sm text-[#98a2b3]">Price on request</span>
              )}
              <span
                className={cn(
                  'inline-flex h-9 items-center justify-center rounded-[var(--radius)] px-4 text-sm font-semibold',
                  emphasized ? 'bg-[#101828] text-white' : 'bg-white text-[#101828]',
                )}
              >
                {user ? 'Continue' : 'Get started'}
              </span>
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
  const [subscribing, setSubscribing] = React.useState(false);

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
  const chosen = planFromList(plans, selected);

  const confirm = async () => {
    setError('');
    setSubscribing(true);
    try {
      await subscribeToPlan(selected);
      toast.success('Continue in checkout to finish.');
      router.push('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start that plan.');
      setSubscribing(false);
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
                  {formatPlanPrice(plan) ?? '—'}
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
            {[chosen.name, formatPlanPrice(chosen)].filter(Boolean).join(' · ')}
          </p>
          <Button type="button" className="h-10 px-5" loading={subscribing} onClick={confirm}>
            {subscribing ? 'Processing' : 'Confirm'}
          </Button>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-[#b42318]">{error}</p> : null}
    </div>
  );
}

function forThisProduct(row: { productSlug?: string }) {
  return !row.productSlug || row.productSlug === PRODUCT_SLUG;
}

function dated(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  return formatLongDate(value);
}

function BillingRows({
  rows,
}: {
  rows: { id: string; title: string; detail: string; amount?: string; status: string; href?: string | null }[];
}) {
  if (rows.length === 0) return null;
  return (
    <ul className="mt-3 overflow-hidden rounded-2xl border border-[#e6e8ee]">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center justify-between gap-4 border-t border-[#eef0f3] px-4 py-3 first:border-t-0"
        >
          <span className="min-w-0">
            {row.href ? (
              <a href={row.href} className="block text-sm font-medium text-[#101828] hover:underline" target="_blank" rel="noreferrer">
                {row.title}
              </a>
            ) : (
              <span className="block text-sm font-medium text-[#101828]">{row.title}</span>
            )}
            <span className="text-sm text-[#98a2b3]">{row.detail}</span>
          </span>
          <span className="shrink-0 text-right">
            {row.amount ? <span className="block text-sm font-medium tabular-nums">{row.amount}</span> : null}
            <span className="text-[11px] font-medium tracking-[0.12em] text-[#667085] uppercase">{row.status}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SubscriptionScreen({ highlight }: { highlight?: PlanId | null }) {
  const { user, ready, cancelSubscription } = useSession();
  const plans = useCatalogPlans();
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [canceling, setCanceling] = React.useState(false);
  const [error, setError] = React.useState('');
  const [subscriptions, setSubscriptions] = React.useState<AccountSubscription[] | null>(null);
  const [payments, setPayments] = React.useState<AccountPayment[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void Promise.all([me.subscriptions(), me.payments({ limit: 50 })])
      .then(([subscriptionRows, paymentRows]) => {
        if (cancelled) return;
        setSubscriptions(
          asList<ApiSubscription>(subscriptionRows).filter(forThisProduct).map(mapAccountSubscription),
        );
        setPayments(asList<ApiPayment>(paymentRows).filter(forThisProduct).map(mapAccountPayment));
      })
      .catch((err) => {
        if (cancelled) return;
        setSubscriptions([]);
        setPayments([]);
        setError(err instanceof Error ? err.message : 'Could not load billing.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || !user || !plans) return <LoadingState label="Loading subscription…" />;

  const live = subscriptions?.find((row) => row.active) ?? null;
  const plan = planFromList(plans, live?.planCode || user.planId);
  const active = subscriptions ? Boolean(live) : user.subscriptionStatus === 'active';
  const renews = dated(live?.renewsAt || user.currentPeriodEnd);

  const status = active
    ? [plan?.name || live?.name, plan ? formatPlanPrice(plan) : null, renews ? `Renews ${renews}` : null]
        .filter(Boolean)
        .join(' · ') || 'Active'
    : user.subscriptionStatus === 'canceled'
      ? 'Canceled'
      : 'No active plan';

  const named = (code: string, fallback: string) => planFromList(plans, code)?.name || fallback;
  const subscriptionRows = (subscriptions ?? []).map((row) => ({
    id: row.id,
    title: named(row.planCode, row.name),
    detail: dated(row.renewsAt) ? `${row.active ? 'Renews' : 'Ended'} ${dated(row.renewsAt)}` : 'Subscription',
    status: row.status,
  }));
  const paymentRows = (payments ?? []).map((row) => ({
    id: row.id,
    title: named(row.planCode, row.label || 'One-day pass'),
    detail: dated(row.at) || 'Payment',
    amount: formatMoney(row.amount, row.currency),
    status: row.status,
    href: row.invoiceUrl,
  }));

  const cancel = async () => {
    setCanceling(true);
    setError('');
    try {
      await cancelSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open billing.');
      setCanceling(false);
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">Subscription</h1>
          <p className="mt-1 text-sm text-[#667085]">{status}</p>
        </div>
        {active ? (
          <Button type="button" variant="outline" className="shrink-0" onClick={() => setConfirmCancel(true)}>
            Cancel
          </Button>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
      <ConfirmDrawer
        open={confirmCancel}
        title="Cancel this subscription?"
        description="You’ll finish in billing. Forecast access stays through the end of the current period."
        subject={plan ? { title: plan.name, detail: formatPlanPrice(plan) ?? undefined } : undefined}
        confirmLabel="Continue to billing"
        busy={canceling}
        onClose={() => {
          if (!canceling) setConfirmCancel(false);
        }}
        onConfirm={() => {
          void cancel();
        }}
      />

      <div className="mt-6">
        <AccountPlanSelector highlight={highlight} />
      </div>

      <h2 className="mt-10 text-[15px] font-semibold text-[#101828]">Subscriptions</h2>
      {subscriptions === null ? (
        <LoadingState compact label="Loading subscriptions…" className="min-h-0 justify-start px-0 py-3" />
      ) : subscriptionRows.length === 0 ? (
        <p className="mt-3 text-sm text-[#667085]">No subscriptions yet.</p>
      ) : (
        <BillingRows rows={subscriptionRows} />
      )}

      <h2 className="mt-10 text-[15px] font-semibold text-[#101828]">One-day pass</h2>
      {payments === null ? (
        <LoadingState compact label="Loading payments…" className="min-h-0 justify-start px-0 py-3" />
      ) : paymentRows.length === 0 ? (
        <p className="mt-3 text-sm text-[#667085]">No one-day pass payments yet.</p>
      ) : (
        <BillingRows rows={paymentRows} />
      )}
    </div>
  );
}
