'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLockup, LogoMark } from '@/components/brand/Logo';
import { RequireAuth } from '@/components/app/RequireAuth';
import { useSession } from '@/components/app/SessionProvider';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initialsFromName } from '@/lib/session';
import { SITE } from '@/data/site';
import { cn } from '@/lib/utils';

type AdminIconName =
  | 'grid'
  | 'calendar-event'
  | 'send'
  | 'people'
  | 'gear'
  | 'box-arrow-up-right'
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
  { href: '/admin/settings', label: 'Settings', icon: 'gear' },
] as const;

function sectionLabel(pathname: string) {
  if (pathname.startsWith('/admin/forecasts/new')) return 'New forecast';
  if (pathname.startsWith('/admin/forecasts')) return 'Forecasts';
  if (pathname.startsWith('/admin/deliveries')) return 'Deliveries';
  if (pathname.startsWith('/admin/subscribers')) return 'Subscribers';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f4f6] px-4 text-center">
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
    <div className="min-h-screen bg-[#eef1f4] text-[#101828]">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[260px] gap-0 border-0 bg-[#0d1117] p-0 shadow-xl sm:max-w-[260px]"
        >
          <SheetTitle className="sr-only">Publishing menu</SheetTitle>
          <SidebarBody onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col bg-[#0d1117] transition-transform duration-200 ease-out lg:flex',
          desktopOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full',
        )}
      >
        <SidebarBody />
      </aside>

      <div
        className={cn(
          'min-h-screen transition-[padding] duration-200 ease-out',
          desktopOpen ? 'lg:pl-[220px]' : 'lg:pl-0',
        )}
      >
        <header className="sticky top-0 z-20 border-b border-[#e4e7ec] bg-white">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={toggleNav}
              aria-label={menuOpen ? 'Hide menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-[#667085] hover:bg-[#f2f4f7] hover:text-[#101828]"
            >
              <AdminIcon name="list" className="text-[18px]" />
            </button>
            <p className="truncate text-sm font-medium text-[#344054]">{sectionLabel(pathname)}</p>
            <div className="ml-auto">
              <EditorChip />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function EditorChip() {
  const { user, logout } = useSession();
  const router = useRouter();
  const name = user?.name ?? 'Editor';
  const email = user?.email ?? '';
  const label = name.includes('@') ? name.split('@')[0] : name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 hover:bg-[#f2f4f7]"
          aria-label="Editor menu"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#0B3A82] text-[11px] font-semibold text-white">
            {initialsFromName(label)}
          </span>
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block max-w-[180px] truncate text-sm font-medium leading-4">{label}</span>
            {email ? <span className="block max-w-[180px] truncate text-[11px] text-[#98a2b3]">{email}</span> : null}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        <DropdownMenuItem
          onSelect={() => {
            logout();
            router.push('/');
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarBody({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-white/10 px-4">
        <LogoMark className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{SITE.name}</p>
          <p className="text-[10px] tracking-wide text-white/40 uppercase">Desk</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <AdminIcon name="x-lg" className="text-[16px]" />
          </button>
        ) : null}
      </div>
      <nav aria-label="Publishing" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {deskLinks.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors',
                active ? 'bg-[#0B3A82] font-medium text-white' : 'text-white/65 hover:bg-white/5 hover:text-white',
              )}
            >
              <AdminIcon name={link.icon} className={cn('text-[15px]', active ? 'text-white' : 'text-white/40')} />
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/feed"
          onClick={onClose}
          className="mt-3 flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-white/45 hover:bg-white/5 hover:text-white"
        >
          <AdminIcon name="box-arrow-up-right" className="text-[15px] text-white/30" />
          Subscriber feed
        </Link>
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <a href={`mailto:${SITE.email}`} className="text-xs text-white/45 hover:text-white">
          Contact support
        </a>
      </div>
    </div>
  );
}
