'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLockup, LogoMark } from '@/components/brand/Logo';
import { RequireAuth } from '@/components/app/RequireAuth';
import { useSession } from '@/components/app/SessionProvider';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { initialsFromName } from '@/lib/session';
import { SITE } from '@/data/site';
import { cn } from '@/lib/utils';

type AdminIconName =
  | 'grid'
  | 'calendar-event'
  | 'send'
  | 'people'
  | 'box-arrow-up-right'
  | 'box-arrow-right'
  | 'list'
  | 'x-lg';

function AdminIcon({ name, className }: { name: AdminIconName; className?: string }) {
  return <i className={cn('bi leading-none', `bi-${name}`, className)} aria-hidden />;
}

const deskLinks = [
  { href: '/admin', label: 'Overview', icon: 'grid' },
  { href: '/admin/forecasts', label: 'Forecasts', icon: 'calendar-event' },
  { href: '/admin/deliveries', label: 'Deliveries', icon: 'send' },
  { href: '/admin/subscribers', label: 'Subscribers', icon: 'people' },
] as const;

function sectionLabel(pathname: string) {
  if (pathname.startsWith('/admin/forecasts/new')) return 'New forecast';
  if (pathname.startsWith('/admin/forecasts')) return 'Forecasts';
  if (pathname.startsWith('/admin/deliveries')) return 'Deliveries';
  if (pathname.startsWith('/admin/subscribers')) return 'Subscribers';
  return 'Overview';
}

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  if (href === '/admin/forecasts') {
    return pathname === '/admin/forecasts' || /^\/admin\/forecasts\/(?!new$).+/.test(pathname);
  }
  return pathname === href;
}

function isDesktopNav() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminGate>{children}</AdminGate>
    </RequireAuth>
  );
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const { user } = useSession();

  if (user && user.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f7f9] px-4 text-center">
        <BrandLockup />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Publishing desk</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#667085]">
          This area is for TG editors. Log in with the desk account to create forecasts and review
          delivery.
        </p>
        <Link href="/feed" className="mt-6 text-sm font-medium hover:underline">
          Back to the feed
        </Link>
      </div>
    );
  }

  return <AdminChrome>{children}</AdminChrome>;
}

function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSession();
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setMobileOpen(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const menuOpen = isDesktop ? desktopOpen : mobileOpen;
  const toggleNav = () => {
    if (isDesktopNav()) {
      setDesktopOpen((open) => !open);
      return;
    }
    setMobileOpen((open) => !open);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#101828]">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[280px] gap-0 border-0 bg-[#101828] p-0 shadow-xl sm:max-w-[280px]"
        >
          <SheetTitle className="sr-only">Publishing menu</SheetTitle>
          <SidebarBody onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[#101828] transition-transform duration-200 ease-out lg:flex',
          desktopOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full',
        )}
      >
        <SidebarBody />
      </aside>

      <div
        className={cn(
          'min-h-screen transition-[padding] duration-200 ease-out',
          desktopOpen ? 'lg:pl-60' : 'lg:pl-0',
        )}
      >
        <header className="sticky top-0 z-20 bg-[#f4f6f8]">
          <div className="flex h-14 items-center gap-3 px-4 md:px-8">
            <button
              type="button"
              onClick={toggleNav}
              aria-label={menuOpen ? 'Hide menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="grid size-9 shrink-0 place-items-center rounded-[var(--radius)] text-[#667085] transition-colors hover:bg-white hover:text-[#101828]"
            >
              <AdminIcon name="list" className="text-[18px]" />
            </button>
            <p className="truncate text-sm text-[#667085]">{sectionLabel(pathname)}</p>
            <div className="ml-auto flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#101828] text-[11px] font-semibold text-white">
                {user ? initialsFromName(user.name) : 'TG'}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-medium leading-4">{user?.name ?? 'Editor'}</span>
                <span className="block text-[11px] text-[#98a2b3]">Editor</span>
              </span>
            </div>
          </div>
        </header>
        <main className="px-4 pb-10 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarBody({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSession();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-4">
        <LogoMark className="size-9 rounded-[var(--radius)]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{SITE.name}</p>
          <p className="text-[11px] text-white/45">Publishing</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-8 shrink-0 place-items-center rounded-[var(--radius)] text-white/60 hover:bg-white/10 hover:text-white"
          >
            <AdminIcon name="x-lg" className="text-[16px]" />
          </button>
        ) : null}
      </div>
      <nav aria-label="Publishing" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        <p className="px-3 pt-2 pb-2 text-[11px] font-medium tracking-[0.14em] text-white/35 uppercase">
          Main menu
        </p>
        {deskLinks.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors',
                active
                  ? 'bg-white font-medium text-[#101828]'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
              )}
            >
              <AdminIcon
                name={link.icon}
                className={cn('text-[16px]', active ? 'text-[#101828]' : 'text-white/45')}
              />
              {link.label}
            </Link>
          );
        })}
        <div className="mx-3 my-3 h-px bg-white/10" />
        <Link
          href="/feed"
          onClick={onClose}
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-white/70 hover:bg-white/5 hover:text-white"
        >
          <AdminIcon name="box-arrow-up-right" className="text-[16px] text-white/45" />
          Subscriber feed
        </Link>
      </nav>
      <div className="p-3">
        <p className="px-2 pb-3 text-xs text-white/40">
          Need help?{' '}
          <a href={`mailto:${SITE.email}`} className="text-white/75 hover:text-white">
            Contact
          </a>
        </p>
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
            {user ? initialsFromName(user.name) : 'TG'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">{user?.name ?? 'Editor'}</span>
            <span className="block truncate text-xs text-white/50">{user?.email}</span>
          </span>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-[var(--radius)] text-white/60 hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              router.push('/');
            }}
            aria-label="Sign out"
          >
            <AdminIcon name="box-arrow-right" className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
