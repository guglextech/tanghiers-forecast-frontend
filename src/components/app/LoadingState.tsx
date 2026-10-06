import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingStateProps = {
  label?: string;
  className?: string;
  /** Compact inline spinner for embedded sections. */
  compact?: boolean;
};

export function LoadingState({
  label = 'Loading…',
  className,
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 text-sm text-muted-foreground',
        compact ? 'py-8' : 'min-h-[220px] flex-col gap-3 py-12',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn('animate-spin', compact ? 'size-4' : 'size-5')}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
