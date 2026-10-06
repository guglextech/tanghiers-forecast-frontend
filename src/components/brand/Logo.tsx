import Link from 'next/link';
import { SITE } from '@/data/site';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#101828" />
      <rect x="5.5" y="5.5" width="9" height="9" rx="2" fill="#60A5FA" />
      <rect x="17.5" y="5.5" width="9" height="9" rx="2" fill="#2DD4BF" />
      <rect x="5.5" y="17.5" width="9" height="9" rx="2" fill="#FBBF24" />
      <rect x="17.5" y="17.5" width="9" height="9" rx="2" fill="#FB7185" />
    </svg>
  );
}

export function BrandLockup({
  href = '/',
  className,
  tone = 'light',
}: {
  href?: string;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <Link href={href} className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <LogoMark className="size-8 shrink-0 sm:size-9" />
      <span
        className={cn(
          'truncate text-[16px] font-semibold tracking-tight sm:text-[17px]',
          tone === 'dark' ? 'text-white' : 'text-[#101828]',
        )}
      >
        {SITE.name}
      </span>
    </Link>
  );
}
