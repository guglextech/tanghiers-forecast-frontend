'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { BrandLockup } from '@/components/brand/Logo';
import { ProfileMenu } from '@/components/chrome/ProfileMenu';
import { UserAvatar } from '@/components/chrome/UserAvatar';
import { accountNav, deskNav, mainNav, type AppNavItem } from '@/components/chrome/app-nav';
import { useNotifications } from '@/components/app/useNotifications';
import { useSession } from '@/components/app/SessionProvider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

function NavLink({
  item,
  unread,
  onNavigate,
}: {
  item: AppNavItem;
  unread: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = item.match(pathname);
  const Icon = item.icon;
  const showBadge = item.badge === 'notifications' && unread > 0;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
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

function NavSection({
  title,
  items,
  unread,
  onNavigate,
}: {
  title: string;
  items: AppNavItem[];
  unread: number;
  onNavigate?: () => void;
}) {
  if (!items.length) return null;

  return (
    <div>
      <p className="px-3 pb-1.5 text-[11px] font-medium tracking-[0.16em] text-[#98a2b3] uppercase">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink key={item.href} item={item} unread={unread} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useSession();
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const desk = user?.role === 'admin' ? deskNav : [];

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-6">
        <BrandLockup href="/feed" />
      </div>
      <nav aria-label="App" className="flex flex-1 flex-col gap-6 px-3">
        <NavSection title="Main" items={mainNav} unread={unreadCount} onNavigate={onNavigate} />
        <NavSection title="Account" items={accountNav} unread={unreadCount} onNavigate={onNavigate} />
        {desk.length ? (
          <NavSection title="Desk" items={desk} unread={unreadCount} onNavigate={onNavigate} />
        ) : null}
      </nav>
      {user ? (
        <div className="mt-auto border-t border-[#eef0f3] px-3 py-4">
          <div className="flex items-center gap-3 px-2">
            <UserAvatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#101828]">{user.name}</p>
              <button
                type="button"
                className="text-xs text-[#98a2b3] hover:text-[#101828]"
                onClick={() => {
                  onNavigate?.();
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
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] flex-col border-r border-[#eef0f3] bg-white md:flex">
      <SidebarBody />
    </aside>
  );
}

export function MobileAppHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-[#eef0f3] bg-white/95 backdrop-blur md:hidden">
      <div className="flex h-12 items-center gap-2 px-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Open menu">
              <Menu className="size-5" strokeWidth={1.75} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-[232px] max-w-[80vw] gap-0 p-0 sm:max-w-[232px]"
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <BrandLockup href="/feed" className="min-w-0 flex-1" />
        <ProfileMenu />
      </div>
    </header>
  );
}
