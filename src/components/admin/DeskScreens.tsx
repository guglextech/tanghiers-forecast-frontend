'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { type Forecast } from '@/data/forecasts';
import { formatDeskDate, formatDeskStamp } from '@/lib/dates';
import { listAccounts, refreshAccounts } from '@/lib/session';
import { formatMoney } from '@/data/site';
import { admin } from '@/lib/api/resources';
import { mapForecast, mapOverviewReport } from '@/lib/api/mappers';
import type { ApiForecast } from '@/lib/api/types';
import { ForecastActions } from '@/components/admin/ForecastActions';
import { SubscriberActions } from '@/components/admin/SubscriberActions';
import {
  Directory,
  EmptyRow,
  FilterMenu,
  NameCell,
  PageLead,
  Pill,
  PrimaryAction,
  SearchField,
  Th,
  td,
  toneFor,
} from '@/components/admin/desk-ui';
import { useDesk } from '@/components/forecast/useDesk';
import { LoadingState } from '@/components/app/LoadingState';
import { subscribeDesk } from '@/lib/desk';
import { PAGE_SIZE, readPage } from '@/lib/pagination';
import { cn } from '@/lib/utils';

const FORECAST_FILTERS = ['all', 'draft', 'scheduled', 'published', 'archived'] as const;
type ForecastFilter = (typeof FORECAST_FILTERS)[number];

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
    <div className="space-y-6">
      <PageLead
        title="Overview"
        description="Subscribers, forecasts, and delivery for this product."
        action={
          <PrimaryAction href="/admin/forecasts/new">
            <Plus className="size-4" />
            New forecast
          </PrimaryAction>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <dl className="flex overflow-x-auto">
          {cards.map((stat) => (
            <div key={stat.label} className="min-w-[140px] flex-1 border-r border-[#f2f4f7] px-5 py-4 last:border-r-0">
              <dt className="text-xs text-[#98a2b3]">{stat.label}</dt>
              <dd className="mt-1.5 text-xl font-semibold tracking-tight tabular-nums text-[#101828]">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <ForecastTable forecasts={desk.forecasts.slice(0, 6)} title="Latest forecasts" />
    </div>
  );
}

export function ForecastTable({
  forecasts,
  title = 'Forecasts',
  toolbar,
  page = 0,
  total,
  onPage,
  pageSize = PAGE_SIZE,
  onPageSize,
}: {
  forecasts: Forecast[];
  title?: string;
  toolbar?: React.ReactNode;
  page?: number;
  total?: number;
  onPage?: (page: number) => void;
  pageSize?: number;
  onPageSize?: (size: number) => void;
}) {
  const rowTotal = total ?? forecasts.length;
  return (
    <Directory
      title={title}
      toolbar={toolbar}
      page={page}
      total={rowTotal}
      onPage={onPage}
      pageSize={pageSize}
      onPageSize={onPageSize}
    >
      {forecasts.length === 0 ? (
        <EmptyRow>No forecasts yet.</EmptyRow>
      ) : (
        <>
          <ul className="divide-y divide-[#f2f4f7] border-t border-[#f2f4f7] md:hidden">
            {forecasts.map((forecast) => (
              <li key={forecast.id} className="flex items-center gap-3 px-5 py-3.5">
                <NameCell name={forecast.title} href={`/admin/forecasts/${forecast.id}`} caps={false} />
                <div className="ml-auto flex items-center gap-2">
                  <Pill tone={toneFor(forecast.status)}>{forecast.status}</Pill>
                  <ForecastActions forecast={forecast} />
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-y border-[#f2f4f7]">
                  <Th>Forecast</Th>
                  <Th>Date</Th>
                  <Th>Numbers</Th>
                  <Th>Status</Th>
                  <th className="w-12 px-3 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast) => (
                  <tr key={forecast.id} className="border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                    <td className={td}>
                      <NameCell name={forecast.title} href={`/admin/forecasts/${forecast.id}`} caps={false} />
                    </td>
                    <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>{formatDeskDate(forecast.date)}</td>
                    <td className={cn(td, 'tabular-nums text-[#475467]')}>
                      {forecast.numbers.length ? forecast.numbers.join(' · ') : '—'}
                    </td>
                    <td className={td}>
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
        </>
      )}
    </Directory>
  );
}

export function ForecastList() {
  const [filter, setFilter] = React.useState<ForecastFilter>('all');
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);
  const [rows, setRows] = React.useState<Forecast[]>([]);
  const [total, setTotal] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = () => {
      const status = filter === 'all' ? undefined : filter.toUpperCase();
      void admin
        .forecasts({ limit: pageSize, offset: page * pageSize, status })
        .then((payload) => {
          if (cancelled) return;
          const result = readPage<ApiForecast>(payload);
          if (page > 0 && result.items.length === 0 && result.total > 0) {
            setPage((current) => Math.max(0, current - 1));
            return;
          }
          setRows(result.items.map(mapForecast));
          setTotal(result.total);
        })
        .catch(() => {
          if (cancelled) return;
          setRows([]);
          setTotal(0);
        })
        .finally(() => {
          if (!cancelled) setReady(true);
        });
    };
    load();
    const unsubscribe = subscribeDesk(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [filter, page, pageSize]);

  if (!ready) return <LoadingState label="Loading forecasts…" />;

  const visible = query.trim()
    ? rows.filter((forecast) => forecast.title.toLowerCase().includes(query.trim().toLowerCase()))
    : rows;

  return (
    <div className="space-y-6">
      <PageLead
        title="Forecasts"
        description="Draft, schedule, publish, or archive."
        action={
          <PrimaryAction href="/admin/forecasts/new">
            <Plus className="size-4" />
            New forecast
          </PrimaryAction>
        }
      />
      <ForecastTable
        forecasts={visible}
        page={page}
        total={total}
        onPage={setPage}
        pageSize={pageSize}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(0);
        }}
        toolbar={
          <>
            <SearchField
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              placeholder="Search by title…"
              label="Search forecasts"
            />
            <FilterMenu
              label="Forecast status"
              value={filter}
              onChange={(value) => {
                setFilter(value);
                setPage(0);
              }}
              options={FORECAST_FILTERS.map((item) => ({ id: item, label: item === 'all' ? 'All' : item }))}
            />
          </>
        }
      />
    </div>
  );
}

export function DeliveryLog() {
  const desk = useDesk();
  const [channel, setChannel] = React.useState<'all' | 'web' | 'email' | 'sms'>('all');
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);
  const rows = (desk?.deliveries ?? [])
    .filter((row) => channel === 'all' || row.channel === channel)
    .filter((row) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return `${row.destination} ${row.userEmail}`.toLowerCase().includes(needle);
    });
  React.useEffect(() => {
    const pages = Math.max(1, Math.ceil(rows.length / pageSize));
    if (page > pages - 1) setPage(pages - 1);
  }, [page, pageSize, rows.length]);
  if (!desk) return <LoadingState label="Loading deliveries…" />;
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);
  const label = (value: 'web' | 'email' | 'sms') =>
    value === 'web' ? 'Site' : value === 'email' ? 'Email' : 'SMS';

  return (
    <div className="space-y-6">
      <PageLead title="Deliveries" description="Who each forecast was sent to, and whether it arrived." />
      <Directory
        title="Delivery log"
        page={page}
        total={rows.length}
        onPage={setPage}
        pageSize={pageSize}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(0);
        }}
        toolbar={
          <>
            <SearchField
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              placeholder="Search by destination…"
              label="Search deliveries"
            />
            <FilterMenu
              label="Delivery channel"
              value={channel}
              onChange={(value) => {
                setChannel(value);
                setPage(0);
              }}
              options={(['all', 'web', 'email', 'sms'] as const).map((item) => ({
                id: item,
                label: item === 'all' ? 'All' : label(item),
              }))}
            />
          </>
        }
      >
        {pageRows.length === 0 ? (
          <EmptyRow>No deliveries yet.</EmptyRow>
        ) : (
          <>
            <ul className="divide-y divide-[#f2f4f7] border-t border-[#f2f4f7] md:hidden">
              {pageRows.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold uppercase">{row.destination || '—'}</p>
                    <p className="mt-1 text-xs text-[#667085]">{formatDeskStamp(row.at)}</p>
                  </div>
                  <Pill tone={toneFor(row.status)}>{row.status}</Pill>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-y border-[#f2f4f7]">
                    <Th>Destination</Th>
                    <Th>Channel</Th>
                    <Th>Status</Th>
                    <Th>When</Th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr key={row.id} className="border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                      <td className={cn(td, 'font-semibold')}>{row.destination || '—'}</td>
                      <td className={cn(td, 'capitalize text-[#475467]')}>{label(row.channel)}</td>
                      <td className={td}>
                        <Pill tone={toneFor(row.status)}>{row.status}</Pill>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>{formatDeskStamp(row.at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Directory>
    </div>
  );
}

export function SubscriberTable() {
  const [accounts, setAccounts] = React.useState<ReturnType<typeof listAccounts>>([]);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<'all' | 'active' | 'disabled'>('all');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);
  const [total, setTotal] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  const load = React.useCallback(async (q: string | undefined, nextPage: number, size: number) => {
    try {
      const result = await refreshAccounts(q, nextPage * size, size);
      setAccounts(result.accounts);
      setTotal(result.total);
    } catch {
      setAccounts(listAccounts());
      setTotal(listAccounts().length);
    } finally {
      setReady(true);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(query.trim() || undefined, page, pageSize);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [load, query, page, pageSize]);

  if (!ready) return <LoadingState label="Loading subscribers…" />;

  const rows = status === 'all' ? accounts : accounts.filter((account) => account.status === status);

  return (
    <div className="space-y-6">
      <PageLead
        title="Subscribers"
        description="Accounts on this product. Search by email or id, then change a role or close an account."
      />
      <Directory
        title="Subscriber directory"
        page={page}
        total={total}
        onPage={setPage}
        pageSize={pageSize}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(0);
        }}
        toolbar={
          <>
            <SearchField
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              placeholder="Search by email or user id…"
              label="Search subscribers"
            />
            <FilterMenu
              label="Subscriber status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(0);
              }}
              options={[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'disabled', label: 'Disabled' },
              ]}
            />
          </>
        }
      >
        {rows.length === 0 ? (
          <EmptyRow>{query.trim() ? 'No accounts match that search.' : 'No subscribers yet.'}</EmptyRow>
        ) : (
          <>
            <ul className="divide-y divide-[#f2f4f7] border-t border-[#f2f4f7] lg:hidden">
              {rows.map((account) => (
                <li key={account.id} className="flex items-center gap-3 px-5 py-3.5">
                  <NameCell name={account.name} />
                  <div className="ml-auto flex items-center gap-2">
                    <Pill tone={toneFor(account.status)}>{account.status}</Pill>
                    <SubscriberActions account={account} onChanged={() => void load(query.trim() || undefined, page, pageSize)} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-y border-[#f2f4f7]">
                    <Th>Subscriber</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Phone</Th>
                    <Th>Joined</Th>
                    <th className="w-12 px-3 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((account) => (
                    <tr key={account.id} className="border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                      <td className={td}>
                        <NameCell name={account.name} />
                      </td>
                      <td className={cn(td, 'text-[#475467]')}>
                        <p>{account.email}</p>
                        {!account.emailVerified ? (
                          <p className="mt-0.5 text-[11px] text-[#98a2b3]">Not verified</p>
                        ) : null}
                      </td>
                      <td className={cn(td, 'text-[#475467]')}>{account.roleLabel}</td>
                      <td className={td}>
                        <Pill tone={toneFor(account.status)}>{account.status}</Pill>
                      </td>
                      <td className={cn(td, 'text-[#475467]')}>
                        {account.phone ? (
                          <>
                            <p>{account.phone}</p>
                            {!account.phoneVerified ? (
                              <p className="mt-0.5 text-[11px] text-[#98a2b3]">Not verified</p>
                            ) : null}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>
                        {account.createdAt ? formatDeskStamp(account.createdAt) : '—'}
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <SubscriberActions account={account} onChanged={() => void load(query.trim() || undefined, page, pageSize)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Directory>
    </div>
  );
}
