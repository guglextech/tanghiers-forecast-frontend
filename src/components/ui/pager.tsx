'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE, pageCount } from '@/lib/pagination';
import { cn } from '@/lib/utils';

function pageWindow(current: number, pages: number) {
  if (pages <= 5) return Array.from({ length: pages }, (_, index) => index);
  const start = Math.min(Math.max(current - 2, 0), pages - 5);
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function Pager({
  page,
  total,
  onPage,
  pageSize = PAGE_SIZE,
}: {
  page: number;
  total: number;
  onPage?: (page: number) => void;
  pageSize?: number;
}) {
  const pages = pageCount(total, pageSize);
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);
  const numbers = pageWindow(page, pages);

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-[#98a2b3]">{total === 0 ? '0 of 0' : `${start}–${end} of ${total}`}</p>
      {onPage && pages > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 0}
            onClick={() => onPage(page - 1)}
            className="grid size-8 place-items-center rounded-[var(--radius)] text-[#667085] hover:bg-[#f2f4f7] disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          {numbers.map((index) => (
            <button
              key={index}
              type="button"
              aria-label={`Page ${index + 1}`}
              aria-current={index === page ? 'page' : undefined}
              onClick={() => onPage(index)}
              className={cn(
                'grid size-8 place-items-center rounded-[var(--radius)] text-xs font-medium',
                index === page ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-[#f2f4f7]',
              )}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= pages - 1}
            onClick={() => onPage(page + 1)}
            className="grid size-8 place-items-center rounded-[var(--radius)] text-[#667085] hover:bg-[#f2f4f7] disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
