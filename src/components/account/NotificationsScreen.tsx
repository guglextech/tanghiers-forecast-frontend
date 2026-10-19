'use client';

import Link from 'next/link';
import { LoadingState } from '@/components/app/LoadingState';
import { useNotifications } from '@/components/app/useNotifications';
import { cn } from '@/lib/utils';

function formatStamp(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function NotificationsScreen() {
  const { items, unreadCount, markRead, markAllRead, ready } = useNotifications();

  if (!ready) return <LoadingState label="Loading notifications…" />;

  const unread = items.filter((notice) => !notice.read);
  const read = items.filter((notice) => notice.read);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-[#667085]">
            {unreadCount === 0 ? 'You’re up to date.' : `${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            className="text-sm font-medium text-[#101828] hover:underline"
            onClick={markAllRead}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-[#667085]">No notifications yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#e6e8ee]">
          {unread.length ? (
            <section>
              <h2 className="bg-[#f7f8fa] px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-[#98a2b3] uppercase">
                Unread
              </h2>
              <ul>
                {unread.map((notice) => (
                  <li key={notice.id} className="border-t border-[#eef0f3] first:border-t-0">
                    <Link
                      href={notice.href}
                      onClick={() => markRead(notice.id)}
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#f7f8fa]"
                    >
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#2e90fa]" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-[#101828]">{notice.title}</span>
                        <span className="mt-0.5 block text-sm text-[#667085]">{notice.body}</span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-[#98a2b3]">{formatStamp(notice.at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {read.length ? (
            <section className={cn(unread.length ? 'border-t border-[#e6e8ee]' : '')}>
              <h2 className="bg-[#f7f8fa] px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-[#98a2b3] uppercase">
                Read
              </h2>
              <ul>
                {read.map((notice) => (
                  <li key={notice.id} className="border-t border-[#eef0f3] first:border-t-0">
                    <Link
                      href={notice.href}
                      onClick={() => markRead(notice.id)}
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#f7f8fa]"
                    >
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#d0d5dd]" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-[#344054]">{notice.title}</span>
                        <span className="mt-0.5 block text-sm text-[#98a2b3]">{notice.body}</span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-[#98a2b3]">{formatStamp(notice.at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
