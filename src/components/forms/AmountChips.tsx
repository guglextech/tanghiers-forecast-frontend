'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type AmountChipsProps = {
  amounts: string[];
  /** Currently entered amount; the matching chip renders selected. */
  value: string;
  onSelect: (value: string) => void;
  /** Optionally disable individual chips (e.g. above available balance). */
  isDisabled?: (value: string) => boolean;
  className?: string;
};

/**
 * Quick-amount picker: rounded pill chips. The selected chip fills with the
 * primary color and shows a check icon.
 */
export function AmountChips({
  amounts,
  value,
  onSelect,
  isDisabled,
  className,
}: AmountChipsProps) {
  return (
    <div
      role="group"
      aria-label="Quick amounts"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {amounts.map((val) => {
        const selected = value === val;
        const disabled = isDisabled?.(val) ?? false;
        return (
          <button
            key={val}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(val)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-[var(--radius)] px-4 text-sm font-semibold tabular-nums transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-40',
              selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground ring-1 ring-inset ring-input/60 hover:bg-muted/50',
            )}
          >
            {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
            GH₵ {val}
          </button>
        );
      })}
    </div>
  );
}
