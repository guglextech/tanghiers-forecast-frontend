'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FORM_HINT, FORM_LABEL } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 max-w-full gap-2">
      {label ? (
        <Label htmlFor={htmlFor} className={FORM_LABEL}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {!error && hint ? <p className={FORM_HINT}>{hint}</p> : null}
    </div>
  );
}

export function IconInput({
  icon,
  className,
  ...props
}: ComponentProps<'input'> & { icon: string }) {
  return (
    <span className="relative block min-w-0 max-w-full">
          <i
        className={cn(
          'bi pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground',
          icon,
        )}
      />
      <Input className={cn('pl-9', className)} {...props} />
    </span>
  );
}

export function AmountInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <span className="relative block min-w-0 max-w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
        GHS
      </span>
      <Input
        type="number"
        inputMode="decimal"
        className={cn('pl-11', className)}
        {...props}
      />
    </span>
  );
}

export function SelectField({
  value,
  onValueChange,
  placeholder = 'Select…',
  options,
  disabled,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface ChoiceOption {
  id: string;
  label: string;
  icon?: string;
  logo?: string;
  hint?: string;
}

/** Compact segmented selector for 2–4 options (networks, providers, exam type). */
export function ChoicePicker({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label?: string;
  options: ChoiceOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label ? <Label className="text-xs text-muted-foreground">{label}</Label> : null}
      <div className="flex h-9 w-full min-w-0 rounded-md border border-input bg-muted/40 p-0.5">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
              title={option.hint}
              className={cn(
                'flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm px-1.5 text-xs font-medium transition-colors',
                selected
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={option.logo} alt="" className="size-4 rounded-full object-cover" />
              ) : option.icon ? (
                <i
                  className={cn(
                    'bi text-sm',
                    option.icon,
                    selected ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              ) : null}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ChipGroup({
  options,
  value,
  onChange,
  disabled,
}: {
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={selected ? 'default' : 'outline'}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className="h-8"
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

export function VerifiedBanner({
  title = 'Account verified',
  name,
  detail,
  lookingUp = false,
  className,
}: {
  title?: string;
  name: string;
  detail?: string;
  lookingUp?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-9 items-center gap-2 rounded-md border border-[#008DFF]/25 bg-[#008DFF]/[0.06] px-3 py-1.5',
        className,
      )}
    >
      {lookingUp ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-[#008DFF]" />
      ) : (
        <Check className="size-4 shrink-0 text-[#008DFF]" strokeWidth={2.5} />
      )}
      <div className="min-w-0">
        <p className="sr-only">{title}</p>
        <p className="truncate text-sm font-bold uppercase tracking-wide text-foreground">
          {lookingUp ? (
            <span className="font-medium normal-case tracking-normal text-muted-foreground">
              {name}
            </span>
          ) : (
            name
          )}
          {detail && !lookingUp ? (
            <span className="ml-1.5 font-normal normal-case tracking-normal text-muted-foreground">
              {detail}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

export function FormButton({
  variant = 'primary',
  className,
  children,
  ...props
}: ComponentProps<'button'> & { variant?: 'primary' | 'ghost' }) {
  return (
    <Button
      type={props.type ?? 'button'}
      variant={variant === 'primary' ? 'default' : 'outline'}
      size="sm"
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

export function LookupButton({
  loading,
  children = 'Look up',
  disabled,
  ...props
}: ComponentProps<'button'> & { loading?: boolean; children?: ReactNode }) {
  return (
    <Button type="button" variant="outline" size="sm" disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
      {children}
    </Button>
  );
}
