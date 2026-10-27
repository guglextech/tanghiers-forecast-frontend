'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ListFilter, Search } from 'lucide-react';
import { Pager } from '@/components/ui/pager';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PAGE_SIZE } from '@/lib/pagination';
import { initialsFromName } from '@/lib/session';
import { cn } from '@/lib/utils';

export function Pill({ children, tone }: { children: React.ReactNode; tone: 'ok' | 'wait' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
        tone === 'ok' && 'bg-[#ecfdf3] text-[#027a48]',
        tone === 'wait' && 'bg-[#fffaeb] text-[#b54708]',
        tone === 'muted' && 'bg-[#f2f4f7] text-[#475467]',
      )}
    >
      {children}
    </span>
  );
}

export function toneFor(status: string): 'ok' | 'wait' | 'muted' {
  if (
    status === 'published' ||
    status === 'active' ||
    status === 'sent' ||
    status === 'delivered' ||
    status === 'available'
  ) {
    return 'ok';
  }
  if (status === 'scheduled' || status === 'queued') return 'wait';
  return 'muted';
}

const MARKS = ['#7C3AED', '#0B3A82', '#0D9488', '#059669'] as const;

export function Mark({ name }: { name: string }) {
  const initials = initialsFromName(name);
  const color = MARKS[(initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % MARKS.length];
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

export function PageLead({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">{title}</h1>
        <p className="mt-1 text-sm text-[#667085]">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function PrimaryAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#101828] px-3.5 text-sm font-semibold text-white hover:bg-[#1d2939]"
    >
      {children}
    </Link>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="relative block w-full max-w-md">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#98a2b3]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border-0 bg-[#f5f6f8] pr-4 pl-10 text-sm text-[#101828] outline-none placeholder:text-[#98a2b3] focus:bg-[#eef0f3]"
      />
    </label>
  );
}

export function FilterMenu<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.id === value);
  const filtered = value !== options[0]?.id;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-4 text-sm',
            filtered
              ? 'border-[#101828] text-[#101828]'
              : 'border-[#e4e7ec] text-[#344054] hover:bg-[#f9fafb]',
          )}
        >
          <ListFilter className="size-4 text-[#667085]" />
          Filter
          {filtered && selected ? (
            <span className="rounded-full bg-[#f2f4f7] px-1.5 text-[11px] font-medium capitalize">{selected.label}</span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              onChange(option.id);
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm capitalize',
              option.id === value ? 'bg-[#f2f4f7] font-medium text-[#101828]' : 'text-[#475467] hover:bg-[#f9fafb]',
            )}
          >
            {option.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function Directory({
  title,
  toolbar,
  page = 0,
  total,
  onPage,
  pageSize = PAGE_SIZE,
  onPageSize,
  children,
}: {
  title: string;
  toolbar?: React.ReactNode;
  page?: number;
  total: number;
  onPage?: (page: number) => void;
  pageSize?: number;
  onPageSize?: (size: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-[15px] font-semibold text-[#101828]">{title}</h2>
        {toolbar ? <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">{toolbar}</div> : null}
      </div>
      {children}
      <div className="border-t border-[#f2f4f7] px-5 py-3">
        <Pager page={page} total={total} onPage={onPage} pageSize={pageSize} onPageSize={onPageSize} />
      </div>
    </section>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-5 py-3 text-left text-xs font-medium whitespace-nowrap text-[#98a2b3]', className)}>
      <span className="inline-flex items-center gap-1">
        {children}
        <span className="inline-flex flex-col text-[#d0d5dd]" aria-hidden>
          <ChevronUp className="size-2.5 -mb-0.5" strokeWidth={2.5} />
          <ChevronDown className="size-2.5 -mt-0.5" strokeWidth={2.5} />
        </span>
      </span>
    </th>
  );
}

export const td = 'px-5 py-3.5 align-middle text-[13px]';

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-12 text-center text-sm text-[#667085]">{children}</p>;
}

export function NameCell({ name, href, caps = true }: { name: string; href?: string; caps?: boolean }) {
  const inner = (
    <>
      <Mark name={name} />
      <span className={cn('truncate text-[13px] font-semibold text-[#101828]', caps && 'tracking-wide uppercase')}>
        {name}
      </span>
    </>
  );
  const className = 'flex min-w-0 items-center gap-3';
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return <span className={className}>{inner}</span>;
}
