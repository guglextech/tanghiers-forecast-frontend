'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLockup } from '@/components/brand/Logo';
import { NotificationBell } from '@/components/chrome/NotificationBell';
import { ProfileMenu } from '@/components/chrome/ProfileMenu';
import { useSession } from '@/components/app/SessionProvider';
import { SITE, footerNav } from '@/data/site';
import { cn } from '@/lib/utils';

export const contentWidth = 'mx-auto w-full max-w-2xl';
export const shellClass = `${contentWidth} px-4 sm:px-6`;

const appLinks = [
  { href: '/feed', label: 'Feed' },
  { href: '/history', label: 'History' },
];

const barClass = 'sticky top-0 z-20 bg-white/80 backdrop-blur-md';

function navClass(active: boolean) {
  return cn(
    'text-sm transition-colors hover:text-[#101828]',
    active ? 'font-medium text-[#101828]' : 'text-[#667085]',
  );
}

function footerLinkClass(active: boolean) {
  return cn(
    'text-[13px] transition-colors hover:text-[#101828]',
    active ? 'font-medium text-[#101828]' : 'text-[#98a2b3]',
  );
}

function isAppActive(pathname: string, href: string) {
  if (href === '/feed') return pathname === '/feed' || pathname.startsWith('/forecasts');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useSession();

  return (
    <header className={barClass}>
      <div className={cn(shellClass, 'flex h-14 items-center justify-between gap-3 md:h-16')}>
        <BrandLockup />
        <div className="hidden items-center gap-2 md:flex">
          <nav aria-label="App" className="flex items-center gap-6">
            {appLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navClass(isAppActive(pathname, link.href))}>
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' ? (
              <Link href="/admin" className={navClass(pathname.startsWith('/admin'))}>
                Desk
              </Link>
            ) : null}
          </nav>
          <NotificationBell />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

export function PublicHeader() {
  const { user, ready } = useSession();
  const pathname = usePathname();

  return (
    <header className={barClass}>
      <div className={cn(shellClass, 'flex h-14 items-center justify-between gap-4 md:h-16')}>
        <BrandLockup />
        <nav aria-label="Site" className="hidden items-center gap-6 md:flex">
          <Link href="/pricing" className={navClass(pathname.startsWith('/pricing'))}>
            Pricing
          </Link>
          <Link href="/about" className={navClass(pathname.startsWith('/about'))}>
            About
          </Link>
          {ready && user ? (
            <Link href="/feed" className={navClass(pathname.startsWith('/feed'))}>
              Feed
            </Link>
          ) : (
            <>
              <Link href="/login" className={navClass(pathname.startsWith('/login'))}>
                Log in
              </Link>
              <Link
                href="/signup?next=/pricing"
                className="inline-flex h-9 items-center rounded-[var(--radius)] bg-[#101828] px-4 text-sm font-semibold text-white hover:bg-[#1d2939]"
              >
                Subscribe
              </Link>
            </>
          )}
        </nav>
        {ready && !user ? (
          <Link
            href="/signup?next=/pricing"
            className="inline-flex h-8 items-center rounded-[var(--radius)] bg-[#101828] px-3.5 text-[13px] font-semibold text-white md:hidden"
          >
            Subscribe
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={cn(
        'mt-auto text-center text-[13px] text-[#98a2b3]',
        compact
          ? 'px-4 pt-10 pb-6 md:px-10 md:pt-14 md:pb-8'
          : 'pt-14 pb-[calc(1.25rem+3.5rem+env(safe-area-inset-bottom))] md:pb-8',
      )}
    >
      {SITE.disclaimer}
    </footer>
  );
}

export function PublicFooter() {
  const pathname = usePathname();

  return (
    <footer className="mt-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className={cn(shellClass, 'flex flex-col gap-3 pt-16 pb-8 sm:flex-row sm:items-center sm:justify-between')}>
        <p className="text-[13px] leading-5 text-[#98a2b3]">
          A {SITE.project} product. {SITE.disclaimer}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
          {footerNav.public.map((link) => (
            <Link key={link.href} href={link.href} className={footerLinkClass(pathname === link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
