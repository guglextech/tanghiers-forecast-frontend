'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLockup } from '@/components/brand/Logo';
import { ProfileMenu } from '@/components/chrome/ProfileMenu';
import { UserAvatar } from '@/components/chrome/UserAvatar';
import { accountNav, deskNav, mainNav, type AppNavItem } from '@/components/chrome/app-nav';
import { useNotifications } from '@/components/app/useNotifications';
import { useSession } from '@/components/app/SessionProvider';
import { cn } from '@/lib/utils';

function NavLink({
  item,
  unread,
}: {
  item: AppNavItem;
  unread: number;
}) {
  const pathname = usePathname();
  const active = item.match(pathname);
  const Icon = item.icon;
  const showBadge = item.badge === 'notifications' && unread > 0;

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      aria-label={showBadge ? `${item.label}, unread` : item.label}
      className={cn(
        'flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors',
        active
          ? 'bg-[#f2f4f7] font-medium text-[#101828]'
          : 'text-[#667085] hover:bg-[#f7f8fa] hover:text-[#101828]',
      )}
    >
      <span className="relative shrink-0">
        <Icon className="size-[18px]" strokeWidth={active ? 2.1 : 1.75} />
        {showBadge ? (
          <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#f04438] ring-2 ring-white" />
        ) : null}
      </span>
      {item.label}
    </Link>
  );
}

function NavSection({ title, items, unread }: { title: string; items: AppNavItem[]; unread: number }) {
  if (!items.length) return null;

  return (
    <div>
      <p className="px-3 pb-1.5 text-[11px] font-medium tracking-[0.16em] text-[#98a2b3] uppercase">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink key={item.href} item={item} unread={unread} />
        ))}
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { user, logout } = useSession();
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const desk = user?.role === 'admin' ? deskNav : [];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] flex-col bg-white md:flex">
      <div className="px-5 pt-5 pb-6">
        <BrandLockup href="/feed" />
      </div>
      <nav aria-label="App" className="flex flex-1 flex-col gap-6 px-3">
        <NavSection title="Main" items={mainNav} unread={unreadCount} />
        <NavSection title="Account" items={accountNav} unread={unreadCount} />
        {desk.length ? <NavSection title="Desk" items={desk} unread={unreadCount} /> : null}
      </nav>
      {user ? (
        <div className="mt-auto px-3 py-4">
          <div className="flex items-center gap-3 px-2">
            <UserAvatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#101828]">{user.name}</p>
              <button
                type="button"
                className="text-xs text-[#98a2b3] hover:text-[#101828]"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export function MobileAppHeader() {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur md:hidden">
      <div className="flex h-12 items-center justify-between px-4">
        <BrandLockup href="/feed" />
        <ProfileMenu />
      </div>
    </header>
  );
}
