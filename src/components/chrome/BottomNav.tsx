'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  CirclePlus,
  Grid2x2,
  House,
  Info,
  LogIn,
  Newspaper,
  Send,
  Tag,
  UsersRound,
} from 'lucide-react';
import { useSession } from '@/components/app/SessionProvider';
import { useNotifications } from '@/components/app/useNotifications';
import { accountNav, deskNav, mainNav } from '@/components/chrome/app-nav';
import { cn } from '@/lib/utils';

export const bottomNavPad = 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0';

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  badge?: number;
};

function TabBar({
  tabs,
  label,
  collapse = 'md',
}: {
  tabs: Tab[];
  label: string;
  collapse?: 'md' | 'lg';
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-[#e6e8ee] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur',
        collapse === 'lg' ? 'lg:hidden' : 'md:hidden',
      )}
    >
      <ul className="mx-auto flex h-14 w-full max-w-3xl px-4 sm:px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <li key={tab.href + tab.label} className="min-w-0 flex-1">
              <Link
                href={tab.href}
                aria-label={tab.badge ? `${tab.label}, unread` : tab.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full min-h-11 touch-manipulation flex-col items-center justify-center gap-0.5 px-1',
                  active ? 'text-[#101828]' : 'text-[#98a2b3]',
                )}
              >
                <span className="relative" aria-hidden>
                  <Icon className="size-5" strokeWidth={active ? 2.15 : 1.7} />
                  {tab.badge ? (
                    <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#f04438] ring-2 ring-white" />
                  ) : null}
                </span>
                <span aria-hidden className="max-w-full truncate text-[10px] font-medium leading-none tracking-wide">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppBottomNav() {
  const { user } = useSession();
  const { unreadCount } = useNotifications();
  const items = [
    ...mainNav,
    accountNav.find((item) => item.href === '/notifications')!,
    accountNav.find((item) => item.href === '/account')!,
    ...(user?.role === 'admin' ? deskNav : []),
  ];
  const tabs: Tab[] = items.map((item) => ({
    href: item.href,
    label: item.label,
    icon: item.icon,
    match: item.match,
    badge: item.badge === 'notifications' ? unreadCount : undefined,
  }));

  return <TabBar tabs={tabs} label="App" />;
}

export function PublicBottomNav() {
  const { user, ready } = useSession();
  const tabs: Tab[] = [
    { href: '/', label: 'Home', icon: House, match: (path) => path === '/' },
    { href: '/pricing', label: 'Pricing', icon: Tag, match: (path) => path.startsWith('/pricing') },
    { href: '/about', label: 'About', icon: Info, match: (path) => path.startsWith('/about') },
    ready && user
      ? {
          href: '/feed',
          label: 'Feed',
          icon: Newspaper,
          match: (path) => path.startsWith('/feed'),
        }
      : {
          href: '/login',
          label: 'Log in',
          icon: LogIn,
          match: (path) => path.startsWith('/login') || path.startsWith('/signup'),
        },
  ];

  return <TabBar tabs={tabs} label="Site" />;
}

export function DeskBottomNav() {
  const tabs: Tab[] = [
    {
      href: '/admin',
      label: 'Overview',
      icon: Grid2x2,
      match: (path) => path === '/admin',
    },
    {
      href: '/admin/forecasts',
      label: 'Forecasts',
      icon: CalendarDays,
      match: (path) =>
        path === '/admin/forecasts' || /^\/admin\/forecasts\/(?!new$).+/.test(path),
    },
    {
      href: '/admin/forecasts/new',
      label: 'New',
      icon: CirclePlus,
      match: (path) => path === '/admin/forecasts/new',
    },
    {
      href: '/admin/deliveries',
      label: 'Sent',
      icon: Send,
      match: (path) => path.startsWith('/admin/deliveries'),
    },
    {
      href: '/admin/subscribers',
      label: 'People',
      icon: UsersRound,
      match: (path) => path.startsWith('/admin/subscribers'),
    },
  ];

  return <TabBar tabs={tabs} label="Publishing" collapse="lg" />;
}
