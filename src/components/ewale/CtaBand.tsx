import type { ReactNode } from 'react';
import { Button } from '@/components/ewale/Button';
import { cn } from '@/lib/utils';

export function CtaBand({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  tone = 'dark',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  tone?: 'dark' | 'green';
  className?: string;
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        tone === 'dark' ? 'bg-[#0b1220] text-white' : 'bg-ewale-green text-white',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-end md:justify-between md:py-20">
        <div className="max-w-xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          {description ? (
            <p className="mt-3 text-base leading-relaxed text-white/65">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href={primary.href} variant={tone === 'green' ? 'dark' : 'default'} size="lg">
            {primary.label}
          </Button>
          {secondary ? (
            <Button href={secondary.href} variant="outlineLight" size="lg">
              {secondary.label}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
