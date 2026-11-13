'use client';

import { ChevronDown, ChevronLeft, ChevronRight } from '@/components/ui/icons';
import { PAGE_SIZE, PAGE_SIZES, pageCount } from '@/lib/pagination';
import { cn } from '@/lib/utils';

const WINDOW = 5;

function visiblePages(current: number, pages: number) {
  const size = Math.min(WINDOW, pages);
  const start = Math.min(Math.max(0, current - Math.floor(size / 2)), pages - size);
  return Array.from({ length: size }, (_, index) => start + index);
}

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
  const arrow =
    'grid size-8 place-items-center rounded-full text-[#667085] transition-colors hover:bg-[#f2f4f7] hover:text-[#101828] disabled:pointer-events-none disabled:opacity-30';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-[#98a2b3] tabular-nums">{total === 0 ? '0 of 0' : `${start}–${end} of ${total}`}</p>
      <div className="ml-auto flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-[#98a2b3]">
          Rows per page
          {onPageSize ? (
            <span className="relative">
              <select
                value={pageSize}
                aria-label="Rows per page"
                onChange={(event) => onPageSize(Number(event.target.value))}
                className="h-8 appearance-none rounded-lg border border-[#eef0f3] bg-[#f9fafb] py-0 pr-7 pl-2.5 text-sm font-medium text-[#344054] outline-none focus:border-[#0B3A82]"
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
            <span className="inline-flex h-8 items-center rounded-lg border border-[#eef0f3] bg-[#f9fafb] px-2.5 text-sm font-medium text-[#344054]">
              {pageSize}
            </span>
          )}
        </label>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={!onPage || current <= 0}
            onClick={() => onPage?.(current - 1)}
            className={arrow}
          >
            <ChevronLeft className="size-4" />
          </button>
          {visiblePages(current, pages).map((index) =>
            index === current ? (
              <span
                key={index}
                aria-current="page"
                className="grid size-8 place-items-center rounded-full bg-[#0B3A82] text-xs font-semibold text-white tabular-nums"
              >
                {index + 1}
              </span>
            ) : (
              <button
                key={index}
                type="button"
                aria-label={`Page ${index + 1}`}
                disabled={!onPage}
                onClick={() => onPage?.(index)}
                className={cn(
                  'grid size-8 place-items-center rounded-full text-xs font-medium text-[#344054] tabular-nums transition-colors',
                  'hover:bg-[#f2f4f7] hover:text-[#101828] disabled:pointer-events-none',
                )}
              >
                {index + 1}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={!onPage || current >= pages - 1}
            onClick={() => onPage?.(current + 1)}
            className={arrow}
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
