'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Receipt,
  ShieldOff,
} from 'lucide-react';
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
  const plans = useCatalogPlans();
  const currentId = user?.subscriptionStatus === 'active' ? user.planId : null;
  const [error, setError] = React.useState('');
  const [checkingOut, setCheckingOut] = React.useState<PlanId | null>(null);
  const autoStarted = React.useRef(false);

  const startCheckout = React.useCallback(
    async (planId: PlanId) => {
      if (!planId || planId === currentId || checkingOut) return;
      setError('');
      setCheckingOut(planId);
      try {
        await subscribeToPlan(planId);
      } catch (err) {
        setCheckingOut(null);
        setError(err instanceof Error ? err.message : 'Could not open checkout.');
      }
    },
    [checkingOut, currentId, subscribeToPlan],
  );

  React.useEffect(() => {
    if (!highlight || !plans?.length || autoStarted.current) return;
    const plan = planFromList(plans, highlight);
    if (!plan || plan.id === currentId) return;
    autoStarted.current = true;
    void startCheckout(plan.id);
  }, [highlight, plans, currentId, startCheckout]);

  if (!plans) return <LoadingState label="Loading plans…" />;
  if (plans.length === 0) {
    return <p className="text-sm text-[#667085]">Plans are being updated. Check back shortly.</p>;
  }

  return (
    <div>
      <div
        className="overflow-hidden rounded-2xl border border-[#dce6f5] bg-white shadow-[0_1px_2px_rgba(11,58,130,0.04)]"
        role="list"
        aria-label="Plans"
      >
        {plans.map((plan) => {
          const isCurrent = currentId === plan.id;
          const busy = checkingOut === plan.id;
          const locked = Boolean(checkingOut) && !busy;
          return (
            <button
              key={plan.id}
              type="button"
              disabled={isCurrent || Boolean(checkingOut)}
              aria-busy={busy || undefined}
              onClick={() => {
                void startCheckout(plan.id);
              }}
              className={cn(
                'flex w-full items-center gap-3 border-t border-[#eef2f8] px-4 py-3.5 text-left first:border-t-0',
                isCurrent ? 'bg-[#f3f7fd]' : 'bg-white hover:bg-[#f8fafc]',
                locked && 'opacity-60',
                busy && 'bg-[#f3f7fd]',
              )}
            >
              <span
                className={cn(
                  'grid size-[18px] shrink-0 place-items-center rounded-full border',
                  isCurrent || busy ? 'border-[#0B3A82] bg-[#0B3A82]' : 'border-[#c9d4e5] bg-white',
                )}
                aria-hidden
              >
                {isCurrent || busy ? <span className="size-1.5 rounded-full bg-white" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#101828]">{plan.name}</span>
                  {isCurrent ? (
                    <span className="inline-flex items-center rounded-full bg-[#e8f1ff] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#0B3A82] uppercase">
                      Current
                    </span>
                  ) : null}
                  {busy ? (
                    <span className="text-xs font-medium text-[#0B3A82]">Opening checkout…</span>
                  ) : null}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-[#101828]">
                {formatPlanPrice(plan) ?? '—'}
              </span>
            </button>
          );
        })}
      </div>
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

function statusTone(status: string): 'ok' | 'wait' | 'danger' | 'muted' {
  const value = status.toLowerCase();
  if (value === 'active' || value === 'paid' || value === 'trialing') return 'ok';
  if (
    value === 'past_due' ||
    value === 'incomplete' ||
    value === 'pending' ||
    value === 'ends soon'
  ) {
    return 'wait';
  }
  if (value === 'canceled' || value === 'cancelled' || value === 'failed' || value === 'unpaid') return 'danger';
  return 'muted';
}

function StatusBadge({ status }: { status: string }) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        tone === 'ok' && 'bg-[#ecfdf3] text-[#027a48]',
        tone === 'wait' && 'bg-[#fffaeb] text-[#b54708]',
        tone === 'danger' && 'bg-[#fef3f2] text-[#b42318]',
        tone === 'muted' && 'bg-[#f2f4f7] text-[#475467]',
      )}
    >
      {tone === 'ok' ? <CheckCircle2 className="size-3" strokeWidth={2} aria-hidden /> : null}
      {status.replace(/_/g, ' ')}
    </span>
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
  const plan = planFromList(plans, live?.planCode || live?.planId || user.planId);
  const active = subscriptions ? Boolean(live) : user.subscriptionStatus === 'active';
  const renews = dated(live?.renewsAt || user.currentPeriodEnd);
  const endingSoon = Boolean(live?.cancelAtPeriodEnd);
  const planName = plan?.name || (live?.name !== 'Subscription' ? live?.name : null) || 'No plan';
  const priceLabel = plan ? formatPlanPrice(plan) : null;
  const statusLabel = endingSoon
    ? 'ends soon'
    : live?.status || (active ? 'active' : user.subscriptionStatus || 'inactive');

  const named = (code: string, fallback: string) => planFromList(plans, code)?.name || fallback;

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
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#0B3A82] uppercase">Billing</p>
        <h1 className="mt-1 text-[1.75rem] font-semibold tracking-tight text-[#101828]">Subscription</h1>
        <p className="mt-1.5 max-w-md text-sm leading-6 text-[#667085]">
          {active
            ? endingSoon
              ? `Access stays open through ${renews || 'the current period'}.`
              : renews
                ? `${planName} renews on ${renews}.`
                : `${planName} is active.`
            : user.subscriptionStatus === 'canceled'
              ? 'Your subscription has ended. Pick a plan to continue.'
              : 'Choose a plan below to unlock forecasts.'}
        </p>
      </header>

      {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

      <section className="overflow-hidden rounded-[24px] border border-[#d7e4f7] bg-[#0B3A82] text-white shadow-[0_12px_32px_rgba(11,58,130,0.18)]">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                  Current plan
                </p>
                <StatusBadge status={statusLabel} />
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{planName}</h2>
              {plan?.cadence ? <p className="mt-1 text-sm text-white/70">{plan.cadence}</p> : null}
            </div>
            {priceLabel ? (
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                <p className="text-[11px] font-medium tracking-wide text-white/60 uppercase">Price</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums">{priceLabel}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-[11px] font-medium tracking-wide text-white/55 uppercase">
                {endingSoon ? 'Ends' : 'Renews'}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
                {renews || '—'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-[11px] font-medium tracking-wide text-white/55 uppercase">Status</p>
              <p className="mt-1 text-sm font-medium capitalize">
                {endingSoon ? 'Cancels at period end' : active ? 'Active billing' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-[15px] font-semibold text-[#101828]">Available plans</h2>
          <p className="mt-0.5 text-sm text-[#98a2b3]">Tap a plan to check out instantly</p>
        </div>
        <AccountPlanSelector highlight={highlight} />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-[#101828]">Payments</h2>
            <p className="mt-0.5 text-sm text-[#98a2b3]">Invoices and one-day passes</p>
          </div>
          {payments && payments.length > 0 ? (
            <span className="text-xs font-medium text-[#98a2b3]">{payments.length} total</span>
          ) : null}
        </div>

        {payments === null ? (
          <LoadingState compact label="Loading payments…" className="min-h-0 justify-start px-0 py-3" />
        ) : payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d0d5dd] px-4 py-8 text-center">
            <Receipt className="mx-auto size-5 text-[#98a2b3]" strokeWidth={1.75} />
            <p className="mt-2 text-sm text-[#667085]">No payments yet.</p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-[#e6eef8] bg-white">
            {payments.map((row) => {
              const title = row.invoiceNumber
                ? `Invoice ${row.invoiceNumber}`
                : named(row.planCode, row.dayPass ? 'One-day pass' : row.label || 'Payment');
              const when = dated(row.at);
              const body = (
                <>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#eef6f1] text-[#125d4a]">
                      <Receipt className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-[#101828]">
                        <span className="truncate">{title}</span>
                        {row.invoiceUrl ? (
                          <ExternalLink className="size-3.5 shrink-0 text-[#98a2b3]" strokeWidth={1.75} />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-sm text-[#98a2b3]">{when || 'Payment'}</span>
                    </span>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold tabular-nums text-[#101828]">
                      {formatMoney(row.amount, row.currency)}
                    </span>
                    <span className="mt-1 inline-flex">
                      <StatusBadge status={row.status} />
                    </span>
                  </span>
                </>
              );
              return (
                <li key={row.id} className="border-t border-[#eef2f8] first:border-t-0">
                  {row.invoiceUrl ? (
                    <a
                      href={row.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-[#f8fafc]"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-center justify-between gap-4 px-4 py-3.5">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {active && !endingSoon ? (
        <section className="rounded-2xl border border-[#fecdca] bg-[#fef3f2] px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#b42318]">
                <ShieldOff className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-[#101828]">Cancel subscription</h2>
                <p className="mt-1 text-sm leading-5 text-[#667085]">
                  You’ll keep access through {renews || 'the end of this billing period'}.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="h-10 shrink-0 bg-[#d92d20] px-5 text-white hover:bg-[#b42318]"
              onClick={() => setConfirmCancel(true)}
            >
              Cancel
            </Button>
          </div>
        </section>
      ) : null}

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
    </div>
  );
}
