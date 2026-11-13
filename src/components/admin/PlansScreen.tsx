'use client';

import * as React from 'react';
import { MoreHorizontal, Plus, RefreshCw } from '@/components/ui/icons';
import { toast } from 'sonner';
import { admin, asList } from '@/lib/api/resources';
import { mapAdminPlan, type AdminPlan } from '@/lib/api/mappers';
import type { ApiPlan } from '@/lib/api/types';
import { fromMinorUnits, toMinorUnits } from '@/lib/plans';
import { formatMoney } from '@/data/site';
import { PAGE_SIZE } from '@/lib/pagination';
import { LoadingState } from '@/components/app/LoadingState';
import {
  DeskScroll,
  Directory,
  EmptyRow,
  FilterMenu,
  NameCell,
  PageLead,
  Pill,
  SearchField,
  Th,
  td,
  stickyEnd,
  stickyStart,
} from '@/components/admin/desk-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const CURRENCIES = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'NZD'] as const;
type KindFilter = 'all' | 'subscription' | 'pass';

function kindTone(kind: string): 'ok' | 'muted' {
  return kind === 'subscription' ? 'ok' : 'muted';
}

function amountLabel(amounts: Record<string, number>, currency = 'USD') {
  const minor = amounts[currency];
  if (typeof minor !== 'number') return '—';
  return formatMoney(fromMinorUnits(minor, currency), currency);
}

function accessLabel(plan: AdminPlan) {
  if (plan.kind === 'pass') {
    if (!plan.passDurationHours) return 'Fixed access';
    if (plan.passDurationHours % 24 === 0) {
      const days = plan.passDurationHours / 24;
      return `${days}-day access`;
    }
    return `${plan.passDurationHours}-hour access`;
  }
  if (!plan.interval) return 'Recurring';
  const count = Math.max(1, plan.intervalCount);
  return count === 1 ? `Every ${plan.interval}` : `Every ${count} ${plan.interval}s`;
}

function toAmountInputs(amounts: Record<string, number>) {
  const next: Record<string, string> = {};
  for (const code of CURRENCIES) {
    const minor = amounts[code];
    next[code] = typeof minor === 'number' ? String(fromMinorUnits(minor, code)) : '';
  }
  return next;
}

function PlanStat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'active';
}) {
  return (
    <div className="rounded-xl border border-[#e4e7ec] bg-white px-4 py-3">
      <p className="text-xs font-medium text-[#667085]">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', tone === 'active' ? 'text-[#067647]' : 'text-[#101828]')}>
        {value}
      </p>
    </div>
  );
}

export function PlansScreen() {
  const [plans, setPlans] = React.useState<AdminPlan[]>([]);
  const [ready, setReady] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [kind, setKind] = React.useState<KindFilter>('all');
  const [page, setPage] = React.useState(0);
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminPlan | null>(null);
  const [pricing, setPricing] = React.useState<AdminPlan | null>(null);

  const load = React.useCallback(async () => {
    const rows = asList<ApiPlan>(await admin.plans())
      .map(mapAdminPlan)
      .filter((plan) => plan.id)
      .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
    setPlans(rows);
    setReady(true);
  }, []);

  React.useEffect(() => {
    void load().catch(() => {
      setPlans([]);
      setReady(true);
    });
  }, [load]);

  const filtered = plans.filter((plan) => {
    const needle = query.trim().toLowerCase();
    const matchesKind = kind === 'all' || plan.kind === kind;
    const matchesQuery =
      !needle ||
      plan.name.toLowerCase().includes(needle) ||
      plan.code.toLowerCase().includes(needle);
    return matchesKind && matchesQuery;
  });

  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const activeCount = plans.filter((plan) => plan.isActive).length;
  const subscriptionCount = plans.filter((plan) => plan.kind === 'subscription').length;
  const passCount = plans.filter((plan) => plan.kind === 'pass').length;

  React.useEffect(() => {
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > pages - 1) setPage(pages - 1);
  }, [filtered.length, page]);

  if (!ready) return <LoadingState label="Loading plans…" />;

  return (
    <div className="space-y-5">
      <PageLead
        title="Plans"
        description="Manage access, billing cadence, delivery channels, and localized prices."
        action={
          <Button
            type="button"
            size="sm"
            className="h-9 bg-[#0B3A82] px-3.5 hover:bg-[#092d66]"
            onClick={() => setCreating(true)}
          >
            <Plus className="size-4" />
            Link plan
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PlanStat label="Total plans" value={plans.length} />
        <PlanStat label="Active" value={activeCount} tone="active" />
        <PlanStat label="Subscriptions" value={subscriptionCount} />
        <PlanStat label="Passes" value={passCount} />
      </div>

      <Directory
        title="Plan directory"
        page={page}
        total={filtered.length}
        onPage={setPage}
        toolbar={
          <>
            <SearchField
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              placeholder="Search by name or code…"
              label="Search plans"
            />
            <FilterMenu
              label="Plan type"
              value={kind}
              onChange={(value) => {
                setKind(value);
                setPage(0);
              }}
              options={[
                { id: 'all', label: 'all' },
                { id: 'subscription', label: 'subscription' },
                { id: 'pass', label: 'pass' },
              ]}
            />
          </>
        }
      >
        {pageRows.length === 0 ? (
          <EmptyRow>{query.trim() || kind !== 'all' ? 'No plans match that filter.' : 'No plans yet.'}</EmptyRow>
        ) : (
          <>
            <ul className="divide-y divide-[#f2f4f7] border-t border-[#f2f4f7] md:hidden">
              {pageRows.map((plan) => (
                <li key={plan.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[#101828]">{plan.name}</p>
                        <span className="shrink-0 rounded bg-[#f2f4f7] px-1.5 py-0.5 font-mono text-[10px] text-[#667085]">
                          {plan.code}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Pill tone={plan.isActive ? 'ok' : 'muted'}>{plan.isActive ? 'active' : 'inactive'}</Pill>
                        <Pill tone={kindTone(plan.kind)}>{plan.kind || '—'}</Pill>
                      </div>
                    </div>
                    <PlanActions
                      plan={plan}
                      onEdit={() => setEditing(plan)}
                      onPrice={() => setPricing(plan)}
                      onSynced={load}
                    />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-[#f9fafb] px-3 py-2.5 text-xs">
                    <div>
                      <dt className="text-[#98a2b3]">Billing / access</dt>
                      <dd className="mt-0.5 font-medium text-[#344054]">{accessLabel(plan)}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-[#98a2b3]">USD price</dt>
                      <dd className="mt-0.5 font-semibold text-[#101828] tabular-nums">{amountLabel(plan.amounts)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            <DeskScroll className="hidden pb-1 md:block">
            <table className="w-full min-w-[720px] table-fixed">
              <thead>
                <tr className="border-y border-[#f2f4f7]">
                  <Th className={cn('w-[34%]', stickyStart)}>Plan</Th>
                  <Th className="w-[13%]">Status</Th>
                  <Th className="w-[15%]">Type</Th>
                  <Th className="w-[20%]">Billing / access</Th>
                  <Th className="w-[12%]">USD price</Th>
                  <th className={cn('w-12 px-3 py-2.5', stickyEnd)}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((plan) => {
                  return (
                    <tr key={plan.id} className="group border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                      <td className={cn(td, stickyStart)}>
                        <div className="min-w-0">
                          <NameCell name={plan.name} />
                          <p className="mt-1 ml-11 truncate font-mono text-[10px] text-[#98a2b3]">{plan.code}</p>
                        </div>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <Pill tone={plan.isActive ? 'ok' : 'muted'}>{plan.isActive ? 'active' : 'inactive'}</Pill>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <Pill tone={kindTone(plan.kind)}>{plan.kind || '—'}</Pill>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>{accessLabel(plan)}</td>
                      <td className={cn(td, 'whitespace-nowrap font-medium tabular-nums')}>
                        {amountLabel(plan.amounts)}
                      </td>
                      <td className={cn('px-3 py-3 text-right', stickyEnd)}>
                        <PlanActions
                          plan={plan}
                          onEdit={() => setEditing(plan)}
                          onPrice={() => setPricing(plan)}
                          onSynced={load}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </DeskScroll>
          </>
        )}
      </Directory>

      <LinkPlanSheet
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={async () => {
          setCreating(false);
          await load();
        }}
      />
      <EditPlanSheet
        plan={editing}
        onClose={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await load();
        }}
      />
      <PriceSheet
        plan={pricing}
        onClose={() => setPricing(null)}
        onSaved={async () => {
          setPricing(null);
          await load();
        }}
      />
    </div>
  );
}

function PlanActions({
  plan,
  onEdit,
  onPrice,
  onSynced,
}: {
  plan: AdminPlan;
  onEdit: () => void;
  onPrice: () => void;
  onSynced: () => Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);

  const sync = async () => {
    setBusy(true);
    try {
      await admin.syncPlan(plan.id);
      toast.success('Plan synced from Stripe.');
      await onSynced();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sync this plan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={busy}
          aria-label={`Actions for ${plan.name}`}
          className="grid size-8 place-items-center rounded-full text-[#667085] hover:bg-[#f2f4f7] hover:text-[#101828] disabled:opacity-50"
        >
          {busy ? <RefreshCw className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={onPrice}>Set prices</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={busy}
          onSelect={() => {
            void sync();
          }}
        >
          Sync from Stripe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PlanSheetSummary({ plan }: { plan: AdminPlan }) {
  return (
    <div className="rounded-xl border border-[#e4e7ec] bg-[#f9fafb] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#101828]">{plan.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-[#667085]">{plan.code}</p>
        </div>
        <Pill tone={plan.isActive ? 'ok' : 'muted'}>{plan.isActive ? 'active' : 'inactive'}</Pill>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Pill tone={kindTone(plan.kind)}>{plan.kind}</Pill>
        <span className="text-xs text-[#667085]">{accessLabel(plan)}</span>
        {plan.channels.length ? <span className="text-xs text-[#98a2b3]">· {plan.channels.join(', ')}</span> : null}
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-[#e4e7ec] pt-3 text-xs">
        <dt className="text-[#98a2b3]">Stripe price</dt>
        <dd className="min-w-0 truncate text-right font-mono text-[#475467]">{plan.providerPriceId || '—'}</dd>
        <dt className="text-[#98a2b3]">Sort order</dt>
        <dd className="text-right font-medium tabular-nums text-[#475467]">{plan.sortOrder}</dd>
      </dl>
    </div>
  );
}

function LinkPlanSheet({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [priceId, setPriceId] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setCode('');
    setName('');
    setPriceId('');
    setError('');
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextCode = code.trim().toLowerCase().replace(/\s+/g, '-');
    const nextName = name.trim();
    const nextPrice = priceId.trim();
    if (!nextCode || !nextName || !nextPrice) {
      setError('Code, name, and Stripe price id are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await admin.createPlan({ code: nextCode, name: nextName, providerPriceId: nextPrice });
      toast.success('Plan linked.');
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not link this plan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Link plan</SheetTitle>
          <SheetDescription>Create a plan from a recurring Stripe price. Interval and amounts are read from Stripe.</SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void submit(event)}>
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="plan-code">Code</Label>
              <Input
                id="plan-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="monthly"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Monthly"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-price-id">Stripe price id</Label>
              <Input
                id="plan-price-id"
                value={priceId}
                onChange={(event) => setPriceId(event.target.value)}
                placeholder="price_"
                className="font-mono"
              />
              <p className="text-xs text-[#98a2b3]">From the Stripe dashboard. Recurring prices only.</p>
            </div>
          </div>
          <SheetFooter className="flex-row justify-end">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} className="bg-[#0B3A82] hover:bg-[#092d66]">
              Link plan
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function EditPlanSheet({
  plan,
  onClose,
  onSaved,
}: {
  plan: AdminPlan | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!plan) return;
    setName(plan.name);
    setDescription(plan.description);
    setError('');
  }, [plan]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!plan) return;
    const nextName = name.trim();
    if (!nextName) {
      setError('Enter a plan name.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await admin.updatePlan(plan.id, { name: nextName, description: description.trim() });
      toast.success('Plan updated.');
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this plan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={Boolean(plan)} onOpenChange={(next) => !next && !busy && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit plan</SheetTitle>
          <SheetDescription>Name and description shown on the public pricing page.</SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void submit(event)}>
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
            {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="edit-plan-name">Name</Label>
              <Input id="edit-plan-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-plan-description">Description</Label>
              <Textarea
                id="edit-plan-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Every forecast, by email and SMS"
                className="min-h-28 resize-y"
              />
            </div>
          </div>
          <SheetFooter className="flex-row justify-end">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} className="bg-[#0B3A82] hover:bg-[#092d66]">
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function PriceSheet({
  plan,
  onClose,
  onSaved,
}: {
  plan: AdminPlan | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [amounts, setAmounts] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!plan) return;
    setAmounts(toAmountInputs(plan.amounts));
    setError('');
  }, [plan]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!plan) return;
    const next: Record<string, number> = {};
    for (const code of CURRENCIES) {
      const raw = amounts[code]?.trim();
      if (!raw) continue;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        setError(`Enter a valid ${code} amount.`);
        return;
      }
      next[code] = toMinorUnits(value, code);
    }
    if (typeof next.USD !== 'number') {
      setError('USD is required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await admin.setPlanPrice(plan.id, next);
      toast.success('Prices updated. Stripe will archive the previous price.');
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set prices.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={Boolean(plan)} onOpenChange={(next) => !next && !busy && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Set prices</SheetTitle>
          <SheetDescription>
            Amounts in major units. This creates a new Stripe price and archives the old one.
          </SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void submit(event)}>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {error ? <p className="mb-4 text-sm text-[#b42318]">{error}</p> : null}
            {plan ? <PlanSheetSummary plan={plan} /> : null}
            <div className="mt-5 grid grid-cols-2 gap-4">
              {CURRENCIES.map((code) => (
                <div key={code} className="space-y-2">
                  <Label htmlFor={`amount-${code}`} className="flex items-center justify-between">
                    <span>{code}</span>
                    {code === 'USD' ? <span className="text-[11px] font-normal text-[#98a2b3]">required</span> : null}
                  </Label>
                  <Input
                    id={`amount-${code}`}
                    inputMode="decimal"
                    value={amounts[code] ?? ''}
                    onChange={(event) =>
                      setAmounts((current) => ({
                        ...current,
                        [code]: event.target.value.replace(/[^\d.]/g, ''),
                      }))
                    }
                    placeholder="0.00"
                    className="tabular-nums"
                  />
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-[#98a2b3]">
              Enter customer-facing amounts. Values are converted to minor units before being sent.
            </p>
          </div>
          <SheetFooter className="flex-row justify-end">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} className="bg-[#0B3A82] hover:bg-[#092d66]">
              Save prices
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
