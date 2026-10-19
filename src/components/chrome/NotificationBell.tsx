'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/components/app/useNotifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const active = pathname.startsWith('/notifications') || pathname.startsWith('/notification');

  return (
    <Link
      href="/notifications"
      aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
      className={cn(
        'relative grid size-9 place-items-center rounded-full transition-colors',
        active ? 'bg-[#f2f4f7] text-[#101828]' : 'text-[#667085] hover:bg-[#f2f4f7] hover:text-[#101828]',
      )}
    >
      <Bell className="size-[18px]" strokeWidth={active ? 2.15 : 1.75} />
      {unreadCount > 0 ? (
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#f04438] ring-2 ring-white" />
      ) : null}
    </Link>
  );
}
