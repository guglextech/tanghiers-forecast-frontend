'use client';

import * as React from 'react';
import Link from 'next/link';
import { BellOff, CheckCheck, ChevronRight, Lock, Send, Sparkles, Sun, type LucideIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/app/LoadingState';
import { useNotifications } from '@/components/app/useNotifications';
import type { Notice } from '@/lib/notifications';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'unread';

const KINDS: Record<string, { icon: LucideIcon; className: string }> = {
  forecast: { icon: Sparkles, className: 'bg-[#eef4ff] text-[#0B3A82]' },
  plan: { icon: Lock, className: 'bg-[#f4f3ff] text-[#5925dc]' },
  delivery: { icon: Send, className: 'bg-[#f0f9ff] text-[#026aa2]' },
  welcome: { icon: Sun, className: 'bg-[#ecfdf3] text-[#067647]' },
};

function kindOf(notice: Notice) {
  if (notice.href.startsWith('/subscription')) return KINDS.plan;
  if (notice.id.endsWith('-welcome')) return KINDS.welcome;
  if (!notice.id.startsWith('n-')) return KINDS.delivery;
  return KINDS.forecast;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function groupLabel(iso: string) {
  const days = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'This week';
  return 'Earlier';
}

function formatStamp(iso: string) {
  const date = new Date(iso);
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (days <= 0) return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function groupNotices(items: Notice[]) {
  const groups: { label: string; items: Notice[] }[] = [];
  for (const notice of items) {
    const label = groupLabel(notice.at);
    const group = groups.find((entry) => entry.label === label);
    if (group) group.items.push(notice);
    else groups.push({ label, items: [notice] });
  }
  return groups;
}

function NoticeRow({ notice, onOpen }: { notice: Notice; onOpen: () => void }) {
  const kind = kindOf(notice);
  const Icon = kind.icon;
  return (
    <li>
      <Link
        href={notice.href}
        onClick={onOpen}
        className={cn(
          'group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors',
          notice.read ? 'hover:bg-[#f7f8fa]' : 'bg-[#f5f8ff] hover:bg-[#eef3fd]',
        )}
      >
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', kind.className)}>
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span
              className={cn(
                'truncate text-[15px]',
                notice.read ? 'font-medium text-[#344054]' : 'font-semibold text-[#101828]',
              )}
            >
              {notice.title}
            </span>
            <span className="shrink-0 text-xs text-[#98a2b3] tabular-nums">{formatStamp(notice.at)}</span>
          </span>
          <span className="mt-0.5 flex items-center gap-2">
            <span className={cn('line-clamp-1 flex-1 text-sm', notice.read ? 'text-[#98a2b3]' : 'text-[#667085]')}>
              {notice.body}
            </span>
            {notice.read ? (
              <ChevronRight
                className="size-4 shrink-0 text-[#d0d5dd] transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            ) : (
              <span className="size-2 shrink-0 rounded-full bg-[#2e90fa]" aria-label="Unread" />
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function NotificationsScreen() {
  const { items, unreadCount, markRead, markAllRead, ready } = useNotifications();
  const [filter, setFilter] = React.useState<Filter>('all');

  if (!ready) return <LoadingState label="Loading notifications…" />;

  const visible = filter === 'unread' ? items.filter((notice) => !notice.read) : items;
  const groups = groupNotices(visible);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-[#667085]">
            {unreadCount === 0 ? 'You’re all caught up.' : `You have ${unreadCount} unread.`}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="mt-1 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#e4e7ec] bg-white px-3 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f7f8fa]"
          >
            <CheckCheck className="size-4" strokeWidth={2} />
            Mark all read
          </button>
        ) : null}
      </div>

      <div role="tablist" aria-label="Filter" className="mt-6 inline-flex rounded-lg bg-[#f2f4f7] p-1">
        {(['all', 'unread'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-colors',
              filter === value ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]',
            )}
          >
            {value === 'all' ? 'All' : 'Unread'}
            {value === 'unread' && unreadCount > 0 ? (
              <span className="rounded-full bg-[#0B3A82] px-1.5 text-[11px] leading-[18px] font-semibold text-white tabular-nums">
                {unreadCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-[#e4e7ec] px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-[#f2f4f7] text-[#98a2b3]">
            <BellOff className="size-5" strokeWidth={2} />
          </span>
          <p className="mt-3 text-[15px] font-semibold text-[#101828]">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="mt-1 text-sm text-[#667085]">New forecasts and account updates will show up here.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="px-3 text-xs font-semibold tracking-[0.08em] text-[#98a2b3] uppercase">{group.label}</h2>
              <ul className="mt-2 space-y-1">
                {group.items.map((notice) => (
                  <NoticeRow key={notice.id} notice={notice} onOpen={() => markRead(notice.id)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
