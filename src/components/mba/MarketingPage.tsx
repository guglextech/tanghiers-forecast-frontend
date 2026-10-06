import type { ReactNode } from 'react';
import MarketingShell from '@/components/ewale/MarketingShell';

export function MarketingPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <MarketingShell>
      <section className="border-b border-border/70 bg-[linear-gradient(165deg,#e8f6ff_0%,transparent_70%)] dark:bg-[linear-gradient(165deg,rgba(0,141,255,0.12)_0%,transparent_70%)]">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 md:pb-16 md:pt-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0070cc] dark:text-[#66c0ff]">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </section>
      {children}
    </MarketingShell>
  );
}
