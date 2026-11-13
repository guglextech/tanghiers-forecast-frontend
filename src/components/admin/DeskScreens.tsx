'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Mail,
  Plus,
  Smartphone,
  Users,
  type LucideIcon,
} from '@/components/ui/icons';
import { type Delivery, type Forecast } from '@/data/forecasts';
import { formatDeskDate, formatDeskStamp } from '@/lib/dates';
import { listAccounts, refreshAccounts } from '@/lib/session';
import { admin } from '@/lib/api/resources';
import { mapForecast, mapOverviewReport, type AdminAccount } from '@/lib/api/mappers';
import type { ApiForecast } from '@/lib/api/types';
import { ForecastActions } from '@/components/admin/ForecastActions';
import { SubscriberActions } from '@/components/admin/SubscriberActions';
import {
  Directory,
  EmptyRow,
  FilterMenu,
  Mark,
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

const subscriberTh = 'py-3 text-xs font-medium tracking-normal normal-case text-[#667085]';

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const CHANNEL_STYLE: Record<Delivery['channel'], { icon: LucideIcon; tile: string; badge: string }> = {
  email: { icon: Mail, tile: 'bg-[#eff8ff] text-[#175cd3]', badge: 'bg-[#eff8ff] text-[#175cd3]' },
  sms: { icon: Smartphone, tile: 'bg-[#ecfdf3] text-[#067647]', badge: 'bg-[#ecfdf3] text-[#067647]' },
  web: { icon: Bell, tile: 'bg-[#f4f3ff] text-[#5925dc]', badge: 'bg-[#f4f3ff] text-[#5925dc]' },
};

function DeliveryCell({ delivery }: { delivery: Delivery }) {
  const style = CHANNEL_STYLE[delivery.channel];
  const Icon = style.icon;
  const showEmail = delivery.userEmail && delivery.userEmail !== delivery.destination;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', style.tile)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#101828]">{delivery.destination || '—'}</p>
        {showEmail ? <p className="mt-0.5 truncate text-xs text-[#667085]">{delivery.userEmail}</p> : null}
      </div>
    </div>
  );
}

const FORECAST_TILE: Record<Forecast['status'], string> = {
  published: 'bg-[#ecfdf3] text-[#067647]',
  scheduled: 'bg-[#eff8ff] text-[#175cd3]',
  draft: 'bg-[#f4f3ff] text-[#5925dc]',
  archived: 'bg-[#f2f4f7] text-[#475467]',
};

function ForecastCell({ forecast }: { forecast: Forecast }) {
  return (
    <Link href={`/admin/forecasts/${forecast.id}`} className="flex min-w-0 items-center gap-3">
      <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', FORECAST_TILE[forecast.status])}>
        <CalendarDays className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[#101828] hover:underline">{forecast.title}</span>
        <span className="mt-0.5 block truncate text-xs text-[#667085]">{formatDeskDate(forecast.date)}</span>
      </span>
    </Link>
  );
}

function SubscriberCell({ account }: { account: AdminAccount }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Mark name={account.name} round />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#101828]">{account.name}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-[#667085]">
          <span className="truncate">{account.email}</span>
          {!account.emailVerified ? (
            <span className="shrink-0 rounded-full bg-[#f2f4f7] px-1.5 py-px text-[10px] font-medium text-[#475467]">
              Unverified
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

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

function OverviewMetric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: 'blue' | 'green' | 'violet' | 'slate';
}) {
  const tones = {
    blue: 'bg-[#eef4ff] text-[#0B3A82]',
    green: 'bg-[#ecfdf3] text-[#067647]',
    violet: 'bg-[#f4f3ff] text-[#5925dc]',
    slate: 'bg-[#f2f4f7] text-[#344054]',
  } as const;
  return (
    <li className="rounded-xl border border-[#e4e7ec] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#667085]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#101828] tabular-nums">{value}</p>
        </div>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', tones[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
    </li>
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

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <PageLead
        title="Overview"
        description="Manage forecasts and keep track of your publishing activity."
        action={
          <PrimaryAction href="/admin/forecasts/new">
            <Plus className="size-4" />
            New forecast
          </PrimaryAction>
        }
      />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <OverviewMetric label="Subscribers" value={String(stats.activeSubscribers)} icon={Users} tone="blue" />
        <OverviewMetric label="Published" value={String(stats.publishedForecasts)} icon={CalendarDays} tone="green" />
        <OverviewMetric label="Emails sent" value={String(stats.emailsSent)} icon={Mail} tone="violet" />
        <OverviewMetric label="SMS queued" value={String(stats.smsQueued)} icon={Smartphone} tone="slate" />
      </ul>

      <section className="overflow-hidden rounded-xl border border-[#dfe3e8] bg-white">
        {featured ? (
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eef4ff] text-[#0B3A82]">
                <CalendarDays className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold tracking-wide text-[#0B3A82] uppercase">Latest forecast</p>
                  <Pill tone={toneFor(featured.status)}>{featured.status}</Pill>
                </div>
                <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-[#101828]">{featured.title}</h2>
                <p className="mt-1 text-sm text-[#667085]">{formatDeskDate(featured.date)}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {featured.status === 'published' ? (
                <Link
                  href={`/forecasts/${featured.id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-[#d0d5dd] bg-white px-3.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb]"
                >
                  View on site
                </Link>
              ) : null}
              <Link
                href={`/admin/forecasts/${featured.id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0B3A82] px-3.5 text-sm font-semibold text-white hover:bg-[#092d66]"
              >
                Open forecast
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-[#0B3A82] uppercase">Latest forecast</p>
              <h2 className="mt-1 text-lg font-semibold">No forecast yet</h2>
              <p className="mt-1 text-sm text-[#667085]">Create your first forecast and publish it for subscribers.</p>
            </div>
            <PrimaryAction href="/admin/forecasts/new">
              <Plus className="size-4" />
              New forecast
            </PrimaryAction>
          </div>
        )}
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2">
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
    <section className="overflow-hidden rounded-xl border border-[#e4e7ec] bg-white">
      <div className="flex items-center justify-between border-b border-[#eef0f3] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#101828]">{title}</h2>
          <span className="rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[11px] font-medium text-[#475467]">
            {items.length}
          </span>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3A82] hover:underline">
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-[#667085]">{empty}</p>
      ) : (
        <ul className="divide-y divide-[#eef0f3]">
          {items.map((forecast) => (
            <li key={forecast.id}>
              <Link
                href={`/admin/forecasts/${forecast.id}`}
                className="group flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-[#f8fafc]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#101828]">{forecast.title}</p>
                  <p className="mt-0.5 text-xs text-[#98a2b3]">{formatDeskDate(forecast.date)}</p>
                </div>
                <Pill tone={toneFor(forecast.status)}>{forecast.status}</Pill>
                <ArrowRight className="size-3.5 shrink-0 text-[#98a2b3] transition-transform group-hover:translate-x-0.5" />
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
  title = 'Forecast Directory',
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
      variant="framed"
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
          <ul className="divide-y divide-[#f2f4f7] md:hidden">
            {forecasts.map((forecast) => (
              <li key={forecast.id} className="flex items-center gap-3 px-4 py-3">
                <ForecastCell forecast={forecast} />
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <Pill tone={toneFor(forecast.status)}>{titleCase(forecast.status)}</Pill>
                  <ForecastActions forecast={forecast} />
                </div>
              </li>
            ))}
          </ul>
          <DeskScroll className="hidden pb-1 md:block">
            <table className="w-full min-w-[760px] table-fixed">
              <thead>
                <tr className="border-b border-[#eef0f3]">
                  <Th className={cn(subscriberTh, 'w-[34%]', stickyStart)}>Forecast</Th>
                  <Th className={cn(subscriberTh, 'w-[28%]')}>Message</Th>
                  <Th className={cn(subscriberTh, 'w-[14%]')}>Status</Th>
                  <Th className={cn(subscriberTh, 'w-[20%]')}>Goes live</Th>
                  <th className={cn('w-12 px-3 py-2.5', stickyEnd)}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast) => (
                  <tr key={forecast.id} className="group border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                    <td className={cn(td, 'py-3', stickyStart)}>
                      <ForecastCell forecast={forecast} />
                    </td>
                    <td className={td}>
                      {forecast.message ? (
                        <p className="truncate text-[#475467]" title={forecast.message}>
                          {forecast.message}
                        </p>
                      ) : (
                        <span className="text-[#98a2b3]">No message</span>
                      )}
                    </td>
                    <td className={cn(td, 'whitespace-nowrap')}>
                      <Pill tone={toneFor(forecast.status)}>{titleCase(forecast.status)}</Pill>
                    </td>
                    <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>
                      {forecast.publishAt ? formatDeskStamp(forecast.publishAt) : 'Not scheduled'}
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
        title="Delivery Log"
        variant="framed"
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
            <ul className="divide-y divide-[#f2f4f7] md:hidden">
              {pageRows.map((row) => (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <DeliveryCell delivery={row} />
                  <span className="ml-auto flex shrink-0 flex-col items-end gap-1">
                    <Pill tone={toneFor(row.status)}>{titleCase(row.status)}</Pill>
                    <span className="text-[11px] text-[#98a2b3]">{formatDeskStamp(row.at)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <DeskScroll className="hidden pb-1 md:block">
              <table className="w-full min-w-[720px] table-fixed">
                <thead>
                  <tr className="border-b border-[#eef0f3]">
                    <Th className={cn(subscriberTh, 'w-[44%]')}>Destination</Th>
                    <Th className={cn(subscriberTh, 'w-[16%]')}>Channel</Th>
                    <Th className={cn(subscriberTh, 'w-[16%]')}>Status</Th>
                    <Th className={cn(subscriberTh, 'w-[24%]')}>When</Th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr key={row.id} className="border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                      <td className={cn(td, 'py-3')}>
                        <DeliveryCell delivery={row} />
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                            CHANNEL_STYLE[row.channel].badge,
                          )}
                        >
                          {label(row.channel)}
                        </span>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <Pill tone={toneFor(row.status)}>{titleCase(row.status)}</Pill>
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
        title="Subscriber Directory"
        variant="framed"
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
                <li key={account.id} className="flex items-center gap-3 px-4 py-3">
                  <SubscriberCell account={account} />
                  <span className="ml-auto flex shrink-0 items-center gap-2">
                    <Pill tone={toneFor(account.status)}>{titleCase(account.status)}</Pill>
                    <SubscriberActions account={account} onChanged={() => void load(query.trim() || undefined, page, pageSize)} />
                  </span>
                </li>
              ))}
            </ul>
            <DeskScroll className="hidden pb-1 lg:block">
              <table className="w-full min-w-[720px] table-fixed">
                <thead>
                  <tr className="border-b border-[#eef0f3]">
                    <Th className={cn(subscriberTh, 'w-[46%]', stickyStart)}>Subscriber</Th>
                    <Th className={cn(subscriberTh, 'w-[14%]')}>Role</Th>
                    <Th className={cn(subscriberTh, 'w-[14%]')}>Status</Th>
                    <Th className={cn(subscriberTh, 'w-[18%]')}>Joined</Th>
                    <th className={cn('w-12 px-3 py-2.5', stickyEnd)}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((account) => (
                    <tr key={account.id} className="group border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                      <td className={cn(td, 'py-3', stickyStart)}>
                        <SubscriberCell account={account} />
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <Pill tone={account.role === 'admin' ? 'ok' : 'muted'}>{titleCase(account.role)}</Pill>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <Pill tone={toneFor(account.status)}>{titleCase(account.status)}</Pill>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>
                        {account.createdAt ? formatDeskDate(account.createdAt) : '—'}
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
