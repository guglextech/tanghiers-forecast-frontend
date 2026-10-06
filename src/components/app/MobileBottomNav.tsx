'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CalendarDays, FolderOpen, Home, MoreHorizontal } from 'lucide-react';
import { mainNav, secondaryNav } from '@/components/app/nav-config';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const tabs = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'Courses', href: '/courses', icon: BookOpen },
  { title: 'Library', href: '/library', icon: FolderOpen },
  { title: 'Calendar', href: '/calendar', icon: CalendarDays },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90 lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid h-[3.75rem] grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 1.75} />
                <span className="truncate">{tab.title}</span>
              </Link>
            );
          })}
          <button
            type="button"
            className={cn(
              'flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium',
              moreOpen ? 'text-foreground' : 'text-muted-foreground',
            )}
            onClick={() => setMoreOpen(true)}
          >
            <MoreHorizontal className="size-[18px]" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle className="text-[15px]">More</SheetTitle>
          </SheetHeader>
          <div className="space-y-0.5 px-2 pb-4">
            {mainNav
              .filter((item) => !tabs.some((tab) => tab.href === item.href))
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex h-10 items-center gap-2.5 rounded-full px-3.5 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-muted text-foreground'
                        : 'text-foreground hover:bg-muted/70',
                    )}
                  >
                    <Icon className={cn('size-4', active ? 'text-foreground' : 'text-muted-foreground')} />
                    {item.title}
                  </Link>
                );
              })}
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex h-10 items-center gap-2.5 rounded-full px-3.5 text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-muted text-foreground'
                      : 'text-foreground hover:bg-muted/70',
                  )}
                >
                  <Icon className={cn('size-4', active ? 'text-foreground' : 'text-muted-foreground')} />
                  {item.title}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 sm:hidden">
              <span className="text-[13px] font-medium">Appearance</span>
              <ThemeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
