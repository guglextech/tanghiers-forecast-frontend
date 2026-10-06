import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: {
  icon: string;
  title: string;
  description: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'gap-0 rounded-2xl border border-gray-200 bg-white py-0 shadow-none transition-colors hover:border-ewale-green/40',
        className
      )}
    >
      <CardHeader className="p-5 pb-0">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ewale-green/10 text-ewale-green">
          <i className={cn('bi text-lg', icon)} aria-hidden />
        </span>
        <CardTitle className="mt-4 text-base tracking-tight text-ink">{title}</CardTitle>
        <CardDescription className="mt-1.5 text-sm leading-relaxed text-ink/55">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0" />
    </Card>
  );
}
