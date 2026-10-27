'use client';

import * as React from 'react';
import Link from 'next/link';
import { type Forecast } from '@/data/forecasts';
import { formatDateTime, formatLongDate } from '@/lib/dates';
import { listAccounts, refreshAccounts } from '@/lib/session';
import { formatMoney } from '@/data/site';
import { admin } from '@/lib/api/resources';
import { mapOverviewReport } from '@/lib/api/mappers';
import { ForecastActions } from '@/components/admin/ForecastActions';
import { SubscriberActions } from '@/components/admin/SubscriberActions';
import { useDesk } from '@/components/forecast/useDesk';
import { LoadingState } from '@/components/app/LoadingState';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function Pill({ children, tone }: { children: React.ReactNode; tone: 'ok' | 'wait' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        tone === 'ok' && 'bg-[#ecfdf3] text-[#027a48]',
        tone === 'wait' && 'bg-[#fffaeb] text-[#b54708]',
        tone === 'muted' && 'bg-[#f2f4f7] text-[#475467]',
      )}
    >
      {children}
    </span>
  );
}

function toneFor(status: string): 'ok' | 'wait' | 'muted' {
  if (
    status === 'published' ||
    status === 'active' ||
    status === 'sent' ||
    status === 'delivered' ||
    status === 'available'
  ) {
    return 'ok';
  }
  if (status === 'scheduled' || status === 'queued') return 'wait';
  return 'muted';
}

const FORECAST_FILTERS = ['all', 'draft', 'scheduled', 'published', 'archived'] as const;
type ForecastFilter = (typeof FORECAST_FILTERS)[number];

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white', className)}>
      {children}
    </div>
  );
}

function PageLead({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-[#667085]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function FilterChips<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-[var(--radius)] bg-[#eef0f3] p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            'h-8 rounded-[var(--radius)] px-3 text-sm capitalize',
            value === option.id ? 'bg-white font-medium text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdminOverview() {
  const desk = useDesk();
  const [report, setReport] = React.useState<Record<string, unknown> | null>(null);

  React.useEffect(() => {
    void admin
      .overview()
      .then((data) => setReport(data && typeof data === 'object' ? (data as Record<string, unknown>) : null))
      .catch(() => setReport(null));
  }, []);

  if (!desk) return <LoadingState label="Loading the desk…" />;

  const stats = mapOverviewReport(report, {
    activeSubscribers: 0,
    publishedForecasts: desk.forecasts.filter((forecast) => forecast.status === 'published').length,
    emailsSent: desk.deliveries.filter(
      (row) => row.channel === 'email' && (row.status === 'sent' || row.status === 'delivered'),
    ).length,
    smsQueued: desk.deliveries.filter((row) => row.channel === 'sms' && row.status === 'queued').length,
    revenue: 0,
    revenueCurrency: 'USD',
  });

  const cards = [
    { label: 'Active subscribers', value: String(stats.activeSubscribers) },
    { label: 'Published', value: String(stats.publishedForecasts) },
    { label: 'Emails sent', value: String(stats.emailsSent) },
    { label: 'SMS queued', value: String(stats.smsQueued) },
    { label: 'Revenue', value: formatMoney(stats.revenue, stats.revenueCurrency) },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageLead title="Overview" description="Subscribers, forecasts, and delivery for this product." />
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#e6e8ee] bg-[#e6e8ee] sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((stat) => (
          <div key={stat.label} className="bg-white px-5 py-4">
            <dt className="text-sm text-[#667085]">{stat.label}</dt>
            <dd className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#344054]">Latest forecasts</h2>
          <Link href="/admin/forecasts" className="text-sm font-medium text-[#475467] hover:text-[#101828]">
            View all
          </Link>
        </div>
        <ForecastTable forecasts={desk.forecasts.slice(0, 6)} />
      </section>
    </div>
  );
}

export function ForecastTable({ forecasts }: { forecasts: Forecast[] }) {
  if (forecasts.length === 0) {
    return (
      <Panel className="px-5 py-8 text-sm text-[#667085]">No forecasts yet.</Panel>
    );
  }
  return (
    <Panel>
      <ul className="divide-y divide-[#eef0f3] md:hidden">
        {forecasts.map((forecast) => (
          <li key={forecast.id} className="flex items-start gap-2 px-3 py-3">
            <Link href={`/admin/forecasts/${forecast.id}`} className="min-w-0 flex-1 py-1">
              <span className="flex items-start justify-between gap-3">
                <span className="font-medium">{forecast.title}</span>
                <Pill tone={toneFor(forecast.status)}>{forecast.status}</Pill>
              </span>
              <span className="mt-1 block text-sm text-[#667085]">
                {formatLongDate(forecast.date)}
                {forecast.numbers.length ? ` · ${forecast.numbers.join(' · ')}` : ''}
              </span>
            </Link>
            <ForecastActions forecast={forecast} />
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#f9fafb] text-[#667085]">
            <tr className="border-b border-[#eef0f3]">
              <th className="px-5 py-3 font-medium">Forecast</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Numbers</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="w-12 px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map((forecast) => (
              <tr key={forecast.id} className="border-b border-[#eef0f3] last:border-0">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/forecasts/${forecast.id}`} className="font-medium hover:underline">
                    {forecast.title}
                  </Link>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-[#475467]">{formatLongDate(forecast.date)}</td>
                <td className="px-5 py-3.5 tabular-nums text-[#475467]">
                  {forecast.numbers.length ? forecast.numbers.join(' · ') : '—'}
                </td>
                <td className="px-5 py-3.5">
                  <Pill tone={toneFor(forecast.status)}>{forecast.status}</Pill>
                </td>
                <td className="px-3 py-3.5 text-right">
                  <ForecastActions forecast={forecast} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function ForecastList() {
  const desk = useDesk();
  const [filter, setFilter] = React.useState<ForecastFilter>('all');
  if (!desk) return <LoadingState label="Loading forecasts…" />;
  const rows =
    filter === 'all' ? desk.forecasts : desk.forecasts.filter((forecast) => forecast.status === filter);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageLead
        title="Forecasts"
        description="Draft, schedule, publish, or archive."
        action={
          <FilterChips
            label="Forecast status"
            value={filter}
            onChange={setFilter}
            options={FORECAST_FILTERS.map((item) => ({ id: item, label: item === 'all' ? 'All' : item }))}
          />
        }
      />
      <ForecastTable forecasts={rows} />
    </div>
  );
}


export function DeliveryLog() {
  const desk = useDesk();
  const [channel, setChannel] = React.useState<'all' | 'web' | 'email' | 'sms'>('all');
  if (!desk) return <LoadingState label="Loading deliveries…" />;
  const rows = desk.deliveries.filter((row) => channel === 'all' || row.channel === channel);
  const label = (value: 'web' | 'email' | 'sms') =>
    value === 'web' ? 'Site' : value === 'email' ? 'Email' : 'SMS';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageLead
        title="Deliveries"
        description="Who each forecast was sent to, and whether it arrived."
        action={
          <FilterChips
            label="Delivery channel"
            value={channel}
            onChange={setChannel}
            options={(['all', 'web', 'email', 'sms'] as const).map((item) => ({
              id: item,
              label: item === 'all' ? 'All' : label(item),
            }))}
          />
        }
      />
      {rows.length === 0 ? (
        <Panel className="px-5 py-8 text-sm text-[#667085]">No deliveries yet.</Panel>
      ) : (
        <Panel>
          <ul className="divide-y divide-[#eef0f3] md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.destination || '—'}</p>
                  <p className="mt-1 text-sm text-[#667085]">{formatDateTime(row.at)}</p>
                </div>
                <Pill tone={toneFor(row.status)}>{row.status}</Pill>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f9fafb] text-[#667085]">
                <tr className="border-b border-[#eef0f3]">
                  <th className="px-5 py-3 font-medium">Destination</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#eef0f3] last:border-0">
                    <td className="px-5 py-3.5 font-medium">{row.destination || '—'}</td>
                    <td className="px-5 py-3.5">
                      <Pill tone={toneFor(row.status)}>{row.status}</Pill>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#475467]">{formatDateTime(row.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

export function SubscriberTable() {
  const [accounts, setAccounts] = React.useState<ReturnType<typeof listAccounts>>([]);
  const [query, setQuery] = React.useState('');
  const [ready, setReady] = React.useState(false);

  const load = React.useCallback(async (q?: string) => {
    try {
      setAccounts(await refreshAccounts(q));
    } catch {
      setAccounts(listAccounts());
    } finally {
      setReady(true);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(query.trim() || undefined);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  if (!ready) return <LoadingState label="Loading subscribers…" />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageLead
        title="Subscribers"
        description="Accounts on this product. Search by email or id, then change a role or close an account."
        action={
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search email or user id"
            className="w-full bg-white sm:w-64"
            aria-label="Search subscribers"
          />
        }
      />
      {accounts.length === 0 ? (
        <Panel className="px-5 py-8 text-sm text-[#667085]">
          {query.trim() ? 'No accounts match that search.' : 'No subscribers yet.'}
        </Panel>
      ) : (
        <Panel>
          <ul className="divide-y divide-[#eef0f3] lg:hidden">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-start gap-2 px-3 py-3">
                <div className="min-w-0 flex-1 py-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{account.name}</p>
                      <p className="mt-1 truncate text-sm text-[#667085]">{account.email}</p>
                    </div>
                    <Pill tone={toneFor(account.status)}>{account.status}</Pill>
                  </div>
                  <p className="mt-2 text-sm text-[#475467]">
                    {account.roleLabel}
                    {account.phone ? ` · ${account.phone}` : ''}
                    {account.createdAt ? ` · ${formatDateTime(account.createdAt)}` : ''}
                  </p>
                </div>
                <SubscriberActions account={account} onChanged={() => void load(query.trim() || undefined)} />
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#f9fafb] text-[#667085]">
                <tr className="border-b border-[#eef0f3]">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="w-12 px-3 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-[#eef0f3] last:border-0">
                    <td className="px-5 py-3.5 font-medium">{account.name}</td>
                    <td className="px-5 py-3.5 text-[#475467]">
                      <p>{account.email}</p>
                      {!account.emailVerified ? (
                        <p className="mt-0.5 text-xs text-[#98a2b3]">Not verified</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5">{account.roleLabel}</td>
                    <td className="px-5 py-3.5">
                      <Pill tone={toneFor(account.status)}>{account.status}</Pill>
                    </td>
                    <td className="px-5 py-3.5 text-[#475467]">
                      {account.phone ? (
                        <>
                          <p>{account.phone}</p>
                          {!account.phoneVerified ? (
                            <p className="mt-0.5 text-xs text-[#98a2b3]">Not verified</p>
                          ) : null}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#475467]">
                      {account.createdAt ? formatDateTime(account.createdAt) : '—'}
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <SubscriberActions account={account} onChanged={() => void load(query.trim() || undefined)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
