import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Shared frame for all app data tables — subtle border, no heavy chrome. */
export function DataTableFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-card', className)}>
      {children}
    </div>
  );
}
