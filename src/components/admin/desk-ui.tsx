'use client';

import * as React from 'react';
import Link from 'next/link';
import { ListFilter, Search } from 'lucide-react';
import { Pager } from '@/components/ui/pager';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PAGE_SIZE } from '@/lib/pagination';
import { initialsFromName } from '@/lib/session';
import { cn } from '@/lib/utils';

export function Pill({ children, tone }: { children: React.ReactNode; tone: 'ok' | 'wait' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium capitalize',
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

const MARKS = ['#0B3A82', '#125d4a', '#344054', '#175cd3'] as const;

export function Mark({ name }: { name: string }) {
  const initials = initialsFromName(name);
  const color = MARKS[(initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % MARKS.length];
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-semibold text-white"
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
        <h1 className="text-2xl font-semibold tracking-tight text-[#101828]">{title}</h1>
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
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0B3A82] px-3.5 text-sm font-semibold text-white hover:bg-[#092d66]"
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
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-[#e4e7ec] bg-white pr-3 pl-9 text-sm text-[#101828] outline-none placeholder:text-[#98a2b3] focus:border-[#0B3A82]"
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
            'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border bg-white px-3 text-sm',
            filtered
              ? 'border-[#0B3A82] text-[#0B3A82]'
              : 'border-[#e4e7ec] text-[#344054] hover:bg-[#f9fafb]',
          )}
        >
          <ListFilter className="size-4" />
          {filtered && selected ? selected.label : 'Filter'}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
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
  showPager = true,
  extra,
  children,
}: {
  title: string;
  toolbar?: React.ReactNode;
  page?: number;
  total: number;
  onPage?: (page: number) => void;
  pageSize?: number;
  onPageSize?: (size: number) => void;
  showPager?: boolean;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e4e7ec] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#eef0f3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="text-sm font-semibold text-[#101828]">{title}</h2>
          {extra}
        </div>
        {toolbar ? <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-xl sm:justify-end">{toolbar}</div> : null}
      </div>
      {children}
      {showPager ? (
        <div className="border-t border-[#eef0f3] px-4 py-2.5">
          <Pager page={page} total={total} onPage={onPage} pageSize={pageSize} onPageSize={onPageSize} />
        </div>
      ) : null}
    </section>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-2.5 text-left text-[11px] font-medium tracking-wide whitespace-nowrap text-[#98a2b3] uppercase', className)}>
      {children}
    </th>
  );
}

export const td = 'px-4 py-3 align-middle text-sm';

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-[#667085]">{children}</p>;
}

export function NameCell({ name, href, caps = false }: { name: string; href?: string; caps?: boolean }) {
  const inner = (
    <>
      <Mark name={name} />
      <span className={cn('truncate font-medium text-[#101828]', caps && 'tracking-wide uppercase')}>{name}</span>
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
