import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Section({
  children,
  className,
  id,
  tone = 'light',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'light' | 'muted' | 'dark' | 'green';
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative',
        tone === 'light' && 'bg-white text-ink',
        tone === 'muted' && 'bg-page text-ink',
        tone === 'dark' && 'bg-[#0b1220] text-white',
        tone === 'green' && 'bg-ewale-green text-white',
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:py-24">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  onDark = false,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  /** Use when parent section has a dark background. */
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ewale-green">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'mt-2 text-3xl font-semibold tracking-tight text-balance md:text-4xl',
          onDark ? 'text-white' : 'text-ink'
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-3 text-base leading-relaxed md:text-[17px]',
            onDark ? 'text-white/60' : 'text-ink/55'
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
