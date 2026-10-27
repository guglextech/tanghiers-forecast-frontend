'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Mail, Plus, Smartphone, Users } from 'lucide-react';
import { type Forecast } from '@/data/forecasts';
import { formatDeskDate, formatDeskStamp } from '@/lib/dates';
import { listAccounts, refreshAccounts } from '@/lib/session';
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
  DeskScroll,
  stickyEnd,
  stickyStart,
  toneFor,
} from '@/components/admin/desk-ui';
import { useDesk } from '@/components/forecast/useDesk';
import { LoadingState } from '@/components/app/LoadingState';
import { subscribeDesk } from '@/lib/desk';
import { PAGE_SIZE, readPage } from '@/lib/pagination';
import { cn } from '@/lib/utils';

const FORECAST_FILTERS = ['all', 'draft', 'scheduled', 'published', 'archived'] as const;
type ForecastFilter = (typeof FORECAST_FILTERS)[number];

function pickFeatured(forecasts: Forecast[]) {
  return (
    forecasts.find((item) => item.status === 'published') ??
    forecasts.find((item) => item.status === 'scheduled') ??
    forecasts.find((item) => item.status === 'draft') ??
    forecasts[0] ??
    null
  );
}

function balls(forecast: Forecast) {
  return {
    banker: forecast.body?.banker ?? forecast.numbers.slice(0, 1),
    twoSure: forecast.body?.twoSure ?? forecast.numbers.slice(1, 3),
    threeDirect: forecast.body?.threeDirect ?? forecast.numbers.slice(3, 6),
  };
}

function NumberBall({ value, tone }: { value: number; tone: 'ink' | 'soft' }) {
  return (
    <span
      className={cn(
        'grid size-8 place-items-center rounded-full text-xs font-semibold tabular-nums',
        tone === 'ink' ? 'bg-[#0B3A82] text-white' : 'bg-[#eef2f6] text-[#344054]',
      )}
    >
      {String(value).padStart(2, '0')}
    </span>
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

  const featured = pickFeatured(desk.forecasts);
  const queue = desk.forecasts.filter((item) => item.status === 'draft' || item.status === 'scheduled').slice(0, 5);
  const published = desk.forecasts.filter((item) => item.status === 'published').slice(0, 5);
  const picks = featured ? balls(featured) : null;

  return (
    <div className="space-y-5">
      <PageLead
        title="Overview"
        description="What to publish next, and how the last forecasts landed."
        action={
          <PrimaryAction href="/admin/forecasts/new">
            <Plus className="size-4" />
            New forecast
          </PrimaryAction>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <section className="rounded-xl border border-[#e4e7ec] bg-white p-5 sm:p-6">
          {featured && picks ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-[#98a2b3] uppercase">On deck</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">{featured.title}</h2>
                  <p className="mt-1 text-sm text-[#667085]">{formatDeskDate(featured.date)}</p>
                </div>
                <Pill tone={toneFor(featured.status)}>{featured.status}</Pill>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-2 text-[11px] font-medium tracking-wide text-[#98a2b3] uppercase">Banker</p>
                  <div className="flex flex-wrap gap-1.5">
                    {picks.banker.map((value, index) => (
                      <NumberBall key={`b-${index}`} value={value} tone="ink" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-medium tracking-wide text-[#98a2b3] uppercase">Two sure</p>
                  <div className="flex flex-wrap gap-1.5">
                    {picks.twoSure.map((value, index) => (
                      <NumberBall key={`t-${index}`} value={value} tone="soft" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-medium tracking-wide text-[#98a2b3] uppercase">Three direct</p>
                  <div className="flex flex-wrap gap-1.5">
                    {picks.threeDirect.map((value, index) => (
                      <NumberBall key={`d-${index}`} value={value} tone="soft" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/admin/forecasts/${featured.id}`}
                  className="inline-flex h-9 items-center rounded-lg bg-[#0B3A82] px-3.5 text-sm font-semibold text-white hover:bg-[#092d66]"
                >
                  Open forecast
                </Link>
                {featured.status === 'published' ? (
                  <Link href={`/forecasts/${featured.id}`} className="text-sm font-medium text-[#0B3A82] hover:underline">
                    View on site
                  </Link>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex min-h-[220px] flex-col items-start justify-center">
              <p className="text-[11px] font-medium tracking-wide text-[#98a2b3] uppercase">On deck</p>
              <h2 className="mt-2 text-xl font-semibold">No forecast yet</h2>
              <p className="mt-1 max-w-sm text-sm text-[#667085]">Write the next draw, then publish it for subscribers.</p>
              <div className="mt-5">
                <PrimaryAction href="/admin/forecasts/new">
                  <Plus className="size-4" />
                  New forecast
                </PrimaryAction>
              </div>
            </div>
          )}
        </section>

        <ul className="grid grid-cols-2 gap-3 xl:grid-cols-1">
          {[
            { label: 'Subscribers', value: String(stats.activeSubscribers), icon: Users },
            { label: 'Published', value: String(stats.publishedForecasts), icon: CalendarDays },
            { label: 'Emails sent', value: String(stats.emailsSent), icon: Mail },
            { label: 'SMS queued', value: String(stats.smsQueued), icon: Smartphone },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-3 rounded-xl border border-[#e4e7ec] bg-white px-4 py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eef3fb] text-[#0B3A82]">
                <item.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-[#667085]">{item.label}</p>
                <p className="text-lg font-semibold tabular-nums">{item.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <QueueCard
          title="Needs attention"
          href="/admin/forecasts"
          empty="No drafts or scheduled forecasts."
          items={queue}
        />
        <QueueCard
          title="Recently published"
          href="/admin/forecasts"
          empty="Nothing published yet."
          items={published}
        />
      </div>
    </div>
  );
}

function QueueCard({
  title,
  href,
  empty,
  items,
}: {
  title: string;
  href: string;
  empty: string;
  items: Forecast[];
}) {
  return (
    <section className="rounded-xl border border-[#e4e7ec] bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-[#0B3A82] hover:underline">
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-4 pb-5 text-sm text-[#667085]">{empty}</p>
      ) : (
        <ul className="divide-y divide-[#eef0f3] border-t border-[#eef0f3]">
          {items.map((forecast) => (
            <li key={forecast.id}>
              <Link
                href={`/admin/forecasts/${forecast.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8fafc]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{forecast.title}</p>
                  <p className="text-xs text-[#98a2b3]">{formatDeskDate(forecast.date)}</p>
                </div>
                <Pill tone={toneFor(forecast.status)}>{forecast.status}</Pill>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
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
  showPager,
}: {
  forecasts: Forecast[];
  title?: string;
  toolbar?: React.ReactNode;
  page?: number;
  total?: number;
  onPage?: (page: number) => void;
  pageSize?: number;
  onPageSize?: (size: number) => void;
  showPager?: boolean;
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
      showPager={showPager ?? Boolean(onPage)}
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
          <DeskScroll className="hidden pb-1 md:block">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-y border-[#f2f4f7]">
                  <Th className={stickyStart}>Forecast</Th>
                  <Th>Date</Th>
                  <Th>Numbers</Th>
                  <Th>Status</Th>
                  <th className={cn('w-12 px-3 py-2.5', stickyEnd)}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast) => (
                  <tr key={forecast.id} className="group border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                    <td className={cn(td, stickyStart)}>
                      <NameCell name={forecast.title} href={`/admin/forecasts/${forecast.id}`} caps={false} />
                    </td>
                    <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>{formatDeskDate(forecast.date)}</td>
                    <td className={cn(td, 'tabular-nums text-[#475467]')}>
                      {forecast.numbers.length ? forecast.numbers.join(' · ') : '—'}
                    </td>
                    <td className={td}>
                      <Pill tone={toneFor(forecast.status)}>{forecast.status}</Pill>
                    </td>
                    <td className={cn('px-3 py-3 text-right', stickyEnd)}>
                      <ForecastActions forecast={forecast} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DeskScroll>
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
            <DeskScroll className="hidden pb-1 md:block">
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
            </DeskScroll>
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
            <ul className="divide-y divide-[#f2f4f7] lg:hidden">
              {rows.map((account) => (
                <li key={account.id}>
                  <DeskScroll className="flex items-center gap-3 px-4 py-3">
                    <NameCell name={account.name} />
                    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#475467]">
                      {account.email}
                      {!account.emailVerified ? <Pill tone="muted">unverified</Pill> : null}
                    </span>
                    <Pill tone={account.role === 'admin' ? 'ok' : 'muted'}>{account.role}</Pill>
                    <Pill tone={toneFor(account.status)}>{account.status}</Pill>
                    <span className="ml-auto">
                      <SubscriberActions account={account} onChanged={() => void load(query.trim() || undefined, page, pageSize)} />
                    </span>
                  </DeskScroll>
                </li>
              ))}
            </ul>
            <DeskScroll className="hidden pb-1 lg:block">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-y border-[#f2f4f7]">
                    <Th className={stickyStart}>Subscriber</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Phone</Th>
                    <Th>Joined</Th>
                    <th className={cn('w-12 px-3 py-2.5', stickyEnd)}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((account) => (
                    <tr key={account.id} className="group border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                      <td className={cn(td, 'whitespace-nowrap', stickyStart)}>
                        <NameCell name={account.name} />
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>
                        <span className="inline-flex items-center gap-2">
                          {account.email}
                          {!account.emailVerified ? <Pill tone="muted">unverified</Pill> : null}
                        </span>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <Pill tone={account.role === 'admin' ? 'ok' : 'muted'}>{account.role}</Pill>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <Pill tone={toneFor(account.status)}>{account.status}</Pill>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>
                        {account.phone ? (
                          <span className="inline-flex items-center gap-2">
                            {account.phone}
                            {!account.phoneVerified ? <Pill tone="muted">unverified</Pill> : null}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>
                        {account.createdAt ? formatDeskStamp(account.createdAt) : '—'}
                      </td>
                      <td className={cn('px-3 py-3 text-right', stickyEnd)}>
                        <SubscriberActions account={account} onChanged={() => void load(query.trim() || undefined, page, pageSize)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DeskScroll>
          </>
        )}
      </Directory>
    </div>
  );
}
