'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/mba/BrandMark';
import { cn } from '@/lib/utils';
import { mainNav, secondaryNav } from '@/components/app/nav-config';
import { ScrollArea } from '@/components/ui/scroll-area';

function NavLink({
  href,
  title,
  icon: Icon,
  active,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex h-10 items-center gap-3 rounded-full px-3.5 text-[13px] transition-colors',
        active
          ? 'bg-muted font-semibold text-foreground'
          : 'font-medium text-foreground/75 hover:bg-muted/70 hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'size-[18px] shrink-0',
          active ? 'text-foreground' : 'text-foreground/60 group-hover:text-foreground',
        )}
      />
      <span className="truncate">{title}</span>
    </Link>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="px-2.5 pb-1.5 pt-0.5 text-[11px] font-medium tracking-[0.12em] text-muted-foreground/80 uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <aside className={cn('flex h-full w-60 flex-col bg-background', className)}>
      <div className="flex h-14 shrink-0 items-center px-4">
        <BrandMark href="/" compact />
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-5 py-3">
          <NavSection label="Hub">
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                active={isActive(item.href)}
              />
            ))}
          </NavSection>
          <NavSection label="Account">
            {secondaryNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                active={isActive(item.href)}
              />
            ))}
          </NavSection>
        </nav>
      </ScrollArea>
    </aside>
  );
}
