'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { BrandLockup } from '@/components/brand/Logo';
import { useSession } from '@/components/app/SessionProvider';
import { SITE, footerNav } from '@/data/site';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const appLinks = [
  { href: '/feed', label: 'Feed' },
  { href: '/history', label: 'History' },
  { href: '/account', label: 'Account' },
];

function navClass(active: boolean) {
  return cn(
    'text-sm transition-colors hover:text-[#101828]',
    active ? 'font-medium text-[#101828]' : 'text-[#667085]',
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSession();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const signOut = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#e6e8ee] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <BrandLockup />
        <nav aria-label="Account" className="hidden items-center gap-5 sm:flex">
          {appLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navClass(pathname === link.href || pathname.startsWith(`${link.href}/`))}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' ? (
            <Link href="/admin" className={navClass(pathname.startsWith('/admin'))}>
              Desk
            </Link>
          ) : null}
          <button type="button" className="text-sm text-[#667085] hover:text-[#101828]" onClick={signOut}>
            Sign out
          </button>
        </nav>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg border border-[#e6e8ee] text-[#344054] sm:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72 sm:max-w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 py-2">
            {appLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#101828] hover:bg-[#f4f6f8]"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' ? (
              <Link href="/admin" className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#101828] hover:bg-[#f4f6f8]">
                Publishing desk
              </Link>
            ) : null}
            <button
              type="button"
              className="rounded-lg px-3 py-2.5 text-left text-sm text-[#667085]"
              onClick={signOut}
            >
              Sign out
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

export function PublicHeader() {
  const { user, ready } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-[#e6e8ee] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <BrandLockup />
        <nav aria-label="Site" className="hidden items-center gap-5 sm:flex">
          <Link href="/pricing" className="text-sm text-[#667085] hover:text-[#101828]">
            Pricing
          </Link>
          <Link href="/about" className="text-sm text-[#667085] hover:text-[#101828]">
            About
          </Link>
          {ready && user ? (
            <Link href="/feed" className="text-sm font-medium text-[#101828]">
              Feed
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#667085] hover:text-[#101828]">
                Log in
              </Link>
              <Link
                href="/signup?next=/pricing"
                className="inline-flex h-9 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white hover:bg-[#1d2939]"
              >
                Subscribe
              </Link>
            </>
          )}
        </nav>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg border border-[#e6e8ee] text-[#344054] sm:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72 sm:max-w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 py-2">
            <Link href="/pricing" className="rounded-lg px-3 py-2.5 text-sm font-medium">
              Pricing
            </Link>
            <Link href="/about" className="rounded-lg px-3 py-2.5 text-sm font-medium">
              About
            </Link>
            <Link href="/contact" className="rounded-lg px-3 py-2.5 text-sm font-medium">
              Contact
            </Link>
            {ready && user ? (
              <Link href="/feed" className="rounded-lg px-3 py-2.5 text-sm font-medium">
                Feed
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm font-medium">
                  Log in
                </Link>
                <Link
                  href="/signup?next=/pricing"
                  className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white"
                >
                  Subscribe
                </Link>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

export function Disclaimer() {
  return (
    <footer className="mt-auto border-t border-[#eef0f3] py-8 text-center text-sm text-[#98a2b3]">
      {SITE.disclaimer}
    </footer>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[#eef0f3]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-[#667085]">A {SITE.project} product. {SITE.disclaimer}</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
            {footerNav.public.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-[#667085] hover:text-[#101828]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
