'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink } from '@/components/ui/icons';
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
            className={cn(
              'flex flex-col gap-4 rounded-2xl border bg-white px-5 py-5 transition-colors sm:flex-row sm:items-center',
              emphasized
                ? 'border-[#d0d5dd] hover:border-[#0B3A82]'
                : 'border-[#e6e8ee] hover:border-[#d0d5dd]',
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[#101828]">{plan.name}</span>
                {plan.featured ? (
                  <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-xs font-medium text-[#0B3A82]">
                    Popular
                  </span>
                ) : null}
              </span>
              {plan.blurb ? (
                <span className="mt-1 block text-sm leading-5 text-[#667085]">{plan.blurb}</span>
              ) : null}
            </span>
            <span className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
              {typeof plan.price === 'number' ? (
                <span className="text-[1.25rem] font-semibold tracking-tight tabular-nums text-[#101828]">
                  {formatMoney(plan.price, plan.currency)}
                  {plan.period ? (
                    <span className="text-sm font-medium text-[#667085]">/{plan.period}</span>
                  ) : null}
                </span>
              ) : (
                <span className="text-sm text-[#667085]">Price on request</span>
              )}
              <span
                className={cn(
                  'inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold',
                  emphasized ? 'bg-[#0B3A82] text-white' : 'border border-[#d0d5dd] bg-white text-[#101828]',
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
      <ul className="overflow-hidden rounded-2xl border border-[#e6e8ee]" aria-label="Plans">
        {plans.map((plan) => {
          const isCurrent = currentId === plan.id;
          const busy = checkingOut === plan.id;
          return (
            <li
              key={plan.id}
              className="flex items-center gap-3 border-t border-[#eef0f3] px-4 py-3.5 first:border-t-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[#101828]">{plan.name}</p>
                  {isCurrent ? (
                    <span className="rounded-full bg-[#e8f1ff] px-2 py-0.5 text-[11px] font-semibold text-[#0B3A82] uppercase">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm tabular-nums text-[#667085]">{formatPlanPrice(plan) ?? '—'}</p>
              </div>
              {isCurrent ? (
                <span className="text-sm text-[#98a2b3]">Subscribed</span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 bg-[#0B3A82] px-4 text-white hover:bg-[#092e68]"
                  loading={busy}
                  disabled={Boolean(checkingOut)}
                  onClick={() => {
                    void startCheckout(plan.id);
                  }}
                >
                  {busy ? 'Opening…' : 'Subscribe'}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
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
    <div>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Subscription</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="text-sm text-[#667085]">
          {[planName, priceLabel, renews ? `${endingSoon ? 'Ends' : 'Renews'} ${renews}` : null]
            .filter(Boolean)
            .join(' · ') || 'No active plan'}
        </p>
        <StatusBadge status={statusLabel} />
      </div>
      {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}

      <div className="mt-6">
        <AccountPlanSelector highlight={highlight} />
      </div>

      <h2 className="mt-10 text-[15px] font-semibold text-[#101828]">Payments</h2>
      {payments === null ? (
        <LoadingState compact label="Loading payments…" className="min-h-0 justify-start px-0 py-3" />
      ) : payments.length === 0 ? (
        <p className="mt-3 text-sm text-[#667085]">No payments yet.</p>
      ) : (
        <ul className="mt-3 overflow-hidden rounded-2xl border border-[#e6e8ee]">
          {payments.map((row) => {
            const title = row.invoiceNumber
              ? `Invoice ${row.invoiceNumber}`
              : named(row.planCode, row.dayPass ? 'One-day pass' : row.label || 'Payment');
            const when = dated(row.at);
            const body = (
              <>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#101828]">
                    <span className="truncate">{title}</span>
                    {row.invoiceUrl ? (
                      <ExternalLink className="size-3.5 shrink-0 text-[#98a2b3]" strokeWidth={1.75} />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-[#98a2b3]">{when || 'Payment'}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-medium tabular-nums text-[#101828]">
                    {formatMoney(row.amount, row.currency)}
                  </span>
                  <span className="mt-1 inline-flex">
                    <StatusBadge status={row.status} />
                  </span>
                </span>
              </>
            );
            return (
              <li key={row.id} className="border-t border-[#eef0f3] first:border-t-0">
                {row.invoiceUrl ? (
                  <a
                    href={row.invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-[#fafafa]"
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

      {active && !endingSoon ? (
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-[#eef0f3] pt-6">
          <p className="text-sm text-[#667085]">
            Access continues through {renews || 'the current period'}.
          </p>
          <Button
            type="button"
            className="h-10 shrink-0 bg-[#d92d20] px-5 text-white hover:bg-[#b42318]"
            onClick={() => setConfirmCancel(true)}
          >
            Cancel
          </Button>
        </div>
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
