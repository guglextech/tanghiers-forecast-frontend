'use client';

import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { FORM_LABEL } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

export type SelectOption = {
  id: string;
  label: string;
  description?: string;
  logo?: string;
};

type SelectOptionCardsProps = {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  /** Kept for API compatibility; chips flow inline. */
  columns?: 1 | 2 | 3;
  /** Keep chips on one row; scroll horizontally if they overflow. */
  nowrap?: boolean;
};

/**
 * Single-select pill chips: muted rounded chips that fill with the primary
 * color and show a check icon when selected. Used for networks, payment
 * methods, bundle types, and similar option groups.
 */
export function SelectOptionCards({
  label,
  options,
  value,
  onChange,
  className,
  nowrap = false,
}: SelectOptionCardsProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      {label ? <Label className={FORM_LABEL}>{label}</Label> : null}
      <div
        className={cn(
          'flex gap-2',
          nowrap
            ? '-mx-1 overflow-x-auto overscroll-x-contain px-1 scrollbar-hide'
            : 'flex-wrap',
        )}
        role="radiogroup"
        aria-label={typeof label === 'string' ? label : 'Options'}
      >
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                selected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground ring-1 ring-inset ring-input/60 hover:bg-muted/50',
              )}
            >
              {selected ? <Check className="size-3.5 shrink-0" strokeWidth={3} /> : null}
              {option.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={option.logo}
                  alt=""
                  className="size-5 shrink-0 rounded-full object-cover ring-1 ring-black/10"
                />
              ) : null}
              <span>{option.label}</span>
              {option.description ? (
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    selected ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  · {option.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
