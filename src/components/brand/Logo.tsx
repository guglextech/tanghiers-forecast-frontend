import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/data/site';
import { cn } from '@/lib/utils';

export function LogoMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={80}
      height={80}
      className={cn('rounded-lg object-cover', className)}
      aria-hidden
      priority={priority}
    />
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
      <LogoMark className="size-8 shrink-0 md:size-9" priority />
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
