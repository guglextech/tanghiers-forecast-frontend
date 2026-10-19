'use client';

import Link from 'next/link';
import { gameById, type Forecast } from '@/data/forecasts';
import { formatWeekdayDay } from '@/lib/dates';
import { LogoMark } from '@/components/brand/Logo';
import { YoutubeFrame } from '@/components/feed/YoutubeFrame';
import { cn } from '@/lib/utils';

export function NumberPills({
  numbers,
  className,
  size = 'md',
}: {
  numbers: number[];
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  return (
    <div className={cn('flex flex-wrap', size === 'md' ? 'gap-3' : 'gap-1.5', className)}>
      {numbers.map((number, index) => (
        <span
          key={`${number}-${index}`}
          className={cn(
            'grid place-items-center rounded-full font-semibold tabular-nums text-[#101828]',
            size === 'xs' && 'size-7 border border-[#101828] text-[11px]',
            size === 'sm' && 'size-9 border-2 border-[#101828] text-sm',
            size === 'md' && 'size-[52px] border-2 border-[#101828] text-xl',
          )}
        >
          {number}
        </span>
      ))}
    </div>
  );
}

export function ForecastPost({
  forecast,
  locked,
  href,
}: {
  forecast: Forecast;
  locked: boolean;
  href?: string;
}) {
  const game = gameById(forecast.game);
  const pills = locked ? (
    <div className="flex gap-1.5" aria-label={`${game.label} numbers are locked`}>
      {Array.from({ length: game.count }).map((_, index) => (
        <span
          key={index}
          className="grid size-[52px] place-items-center rounded-full border-2 border-[#d0d5dd] text-lg text-[#d0d5dd]"
        >
          •
        </span>
      ))}
    </div>
  ) : (
    <NumberPills numbers={forecast.numbers} />
  );

  const title = href && !locked ? (
    <Link href={href} className="text-[15px] font-semibold text-[#101828] hover:underline">
      {forecast.title}
    </Link>
  ) : (
    <p className="text-[15px] font-semibold text-[#101828]">{forecast.title}</p>
  );

  const card = (
    <article
      className={cn(
        'group rounded-2xl border border-[#e6e8ee] bg-white p-4 sm:p-5',
        'transition duration-300 ease-out',
        'hover:-translate-y-1 hover:border-[#d0d5dd] hover:shadow-[0_18px_40px_-24px_rgba(16,24,40,0.35)]',
        'focus-within:-translate-y-1 focus-within:border-[#d0d5dd] focus-within:shadow-[0_18px_40px_-24px_rgba(16,24,40,0.35)]',
      )}
    >
      <div className="flex gap-3">
        <LogoMark className="mt-0.5 size-10 shrink-0" />
        <div className="min-w-0 flex-1">
          {title}
          <p className="mt-0.5 text-sm text-[#667085]">
            {game.label} · {formatWeekdayDay(forecast.date)}
          </p>
        </div>
      </div>
      <div className="mt-4 origin-left transition duration-300 ease-out group-hover:scale-[1.03]">
        {pills}
      </div>
      <div className="mt-4">
        <YoutubeFrame title={`${forecast.title} draw`} locked={locked} />
      </div>
    </article>
  );

  if (locked && href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}

export function ForecastArticle({
  forecast,
  locked,
}: {
  forecast: Forecast;
  locked: boolean;
}) {
  return <ForecastPost forecast={forecast} locked={locked} />;
}
