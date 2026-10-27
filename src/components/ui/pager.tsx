'use client';

import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE, PAGE_SIZES, pageCount } from '@/lib/pagination';
import { cn } from '@/lib/utils';

export function Pager({
  page,
  total,
  onPage,
  pageSize = PAGE_SIZE,
  onPageSize,
}: {
  page: number;
  total: number;
  onPage?: (page: number) => void;
  pageSize?: number;
  onPageSize?: (size: number) => void;
}) {
  const pages = pageCount(total, pageSize);
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);
  const current = Math.min(page, pages - 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-[#98a2b3]">{total === 0 ? '0 of 0' : `${start}–${end} of ${total}`}</p>
      <div className="ml-auto flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-[#98a2b3]">
          Rows per page
          {onPageSize ? (
            <span className="relative">
              <select
                value={pageSize}
                aria-label="Rows per page"
                onChange={(event) => onPageSize(Number(event.target.value))}
                className="h-8 appearance-none rounded-lg border border-[#e4e7ec] bg-white py-0 pr-7 pl-2.5 text-sm text-[#344054] outline-none"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-[#98a2b3]" />
            </span>
          ) : (
            <span className="inline-flex h-8 items-center rounded-lg border border-[#e4e7ec] bg-white px-2.5 text-sm text-[#344054]">
              {pageSize}
            </span>
          )}
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={!onPage || current <= 0}
            onClick={() => onPage?.(current - 1)}
            className="grid size-8 place-items-center rounded-lg text-[#667085] hover:bg-[#f2f4f7] disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span
            aria-current="page"
            className={cn(
              'grid size-8 place-items-center rounded-full text-xs font-semibold',
              'bg-[#101828] text-white',
            )}
          >
            {current + 1}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={!onPage || current >= pages - 1}
            onClick={() => onPage?.(current + 1)}
            className="grid size-8 place-items-center rounded-lg text-[#667085] hover:bg-[#f2f4f7] disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
