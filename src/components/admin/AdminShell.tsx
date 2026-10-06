'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  CalendarDays,
  CirclePlus,
  Grid2x2,
  LogOut,
  Menu,
  Send,
  UsersRound,
} from 'lucide-react';
import { BrandLockup, LogoMark } from '@/components/brand/Logo';
import { RequireAuth } from '@/components/app/RequireAuth';
import { useSession } from '@/components/app/SessionProvider';
import { initialsFromName } from '@/lib/session';
import { SITE } from '@/data/site';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const deskLinks = [
  { href: '/admin', label: 'Overview', icon: Grid2x2 },
  { href: '/admin/forecasts', label: 'Forecasts', icon: CalendarDays },
  { href: '/admin/forecasts/new', label: 'New forecast', icon: CirclePlus },
  { href: '/admin/deliveries', label: 'Deliveries', icon: Send },
  { href: '/admin/subscribers', label: 'Subscribers', icon: UsersRound },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  if (href === '/admin/forecasts') {
    return pathname === '/admin/forecasts' || /^\/admin\/forecasts\/(?!new$).+/.test(pathname);
  }
  return pathname === href;
}

function pageTitle(pathname: string) {
  if (pathname === '/admin') return 'Overview';
  if (pathname === '/admin/forecasts/new') return 'New forecast';
  if (pathname.startsWith('/admin/forecasts/')) return 'Edit forecast';
  if (pathname.startsWith('/admin/forecasts')) return 'Forecasts';
  if (pathname.startsWith('/admin/deliveries')) return 'Deliveries';
  if (pathname.startsWith('/admin/subscribers')) return 'Subscribers';
  return 'Publishing desk';
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
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#101828]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#101828] lg:flex">
        <SidebarBody />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-72 gap-0 border-0 bg-[#101828] p-0 text-white sm:max-w-72"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Publishing menu</SheetTitle>
          </SheetHeader>
          <SidebarBody />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#e6e8ee] bg-white/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-lg border border-[#e6e8ee] text-[#344054] lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-4" strokeWidth={1.75} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium tracking-[0.14em] text-[#98a2b3] uppercase">
                {SITE.project} desk
              </p>
              <h1 className="truncate text-[15px] font-semibold sm:text-base">{pageTitle(pathname)}</h1>
            </div>
            <Link
              href="/admin/forecasts/new"
              className="hidden h-9 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white sm:inline-flex"
            >
              New forecast
            </Link>
            <Link
              href="/feed"
              className="hidden text-sm text-[#667085] hover:text-[#101828] md:inline"
            >
              View site
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
        <p className="px-4 pb-8 text-center text-xs text-[#98a2b3] sm:px-6">{SITE.disclaimer}</p>
      </div>
    </div>
  );
}

function SidebarBody() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSession();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <LogoMark className="size-8" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{SITE.name}</p>
          <p className="text-[11px] text-white/50">Publishing</p>
        </div>
      </div>
      <nav aria-label="Publishing" className="flex-1 space-y-1 px-3 py-4">
        {deskLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                active ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              {link.label}
            </Link>
          );
        })}
        <p className="px-3 pt-6 pb-2 text-[11px] font-medium tracking-[0.14em] text-white/35 uppercase">
          Site
        </p>
        <Link
          href="/feed"
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-white/70 hover:bg-white/5 hover:text-white"
        >
          <ArrowUpRight className="size-4 shrink-0" strokeWidth={1.75} />
          Subscriber feed
        </Link>
      </nav>
      <div className="border-t border-white/10 p-3">
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
            className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              router.push('/');
            }}
            aria-label="Sign out"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
