'use client';

import { cn } from '@/lib/utils';

export function StepBars({
  steps,
  current,
  onSelect,
  label = 'Progress',
}: {
  steps: readonly { title: string }[];
  current: number;
  onSelect?: (index: number) => void;
  label?: string;
}) {
  return (
    <nav aria-label={label} className="mt-8">
      <ol
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((item, index) => {
          const canSelect = Boolean(onSelect) && index < current;
          return (
            <li key={item.title}>
              <button
                type="button"
                className="w-full text-left disabled:opacity-100"
                disabled={!canSelect && index !== current}
                onClick={() => {
                  if (canSelect) onSelect?.(index);
                }}
              >
                <span
                  className={cn(
                    'block h-1 rounded-full',
                    index <= current ? 'bg-[#101828]' : 'bg-[#e6e8ee]',
                  )}
                />
                <span
                  className={cn(
                    'mt-2 block text-xs font-medium',
                    index === current ? 'text-[#101828]' : 'text-[#98a2b3]',
                  )}
                >
                  {item.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
