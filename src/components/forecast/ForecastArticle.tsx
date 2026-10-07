'use client';

import * as React from 'react';
import Link from 'next/link';
import { gameById, type Forecast } from '@/data/forecasts';
import { formatWeekdayDay } from '@/lib/dates';
import { SITE } from '@/data/site';
import { LogoMark } from '@/components/brand/Logo';
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

function formatClock(seconds: number) {
  const whole = Math.min(13, Math.max(0, Math.floor(seconds)));
  return `0:${String(whole).padStart(2, '0')}`;
}

export function MachineFilm({ numbers }: { numbers: number[] }) {
  const [playing, setPlaying] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const timer = React.useRef<number | null>(null);

  const stop = React.useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  }, []);

  React.useEffect(() => () => stop(), [stop]);

  const play = () => {
    stop();
    setPlaying(true);
    setElapsed(0);
    const started = Date.now();
    timer.current = window.setInterval(() => {
      const next = ((Date.now() - started) / 4000) * 13;
      if (next >= 13) {
        setElapsed(13);
        setPlaying(false);
        stop();
        return;
      }
      setElapsed(next);
    }, 80);
  };

  const revealed = Math.min(numbers.length, Math.floor((elapsed / 13) * numbers.length) + (elapsed > 0 ? 1 : 0));

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0b1220] text-white shadow-sm">
      <div className="relative aspect-video">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,#1e3a5f_0%,#0b1220_62%)]" />
        <div className="absolute left-1/2 top-[42%] size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        <div className="absolute left-1/2 top-[42%] size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          {elapsed === 0 && !playing ? (
            <button
              type="button"
              onClick={play}
              className="grid size-16 place-items-center rounded-full bg-white/95 text-[#101828] shadow-lg transition hover:scale-105"
              aria-label="Play machine draw"
            >
              <span className="ml-1 block h-0 w-0 border-y-[9px] border-l-[16px] border-y-transparent border-l-[#101828]" />
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 px-6">
              {numbers.slice(0, revealed).map((number, index) => (
                <span
                  key={`${number}-${index}`}
                  className="grid size-14 place-items-center rounded-full bg-white text-xl font-semibold text-[#101828] shadow-lg"
                >
                  {number}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-3 py-3 text-xs text-white/90">
          <button
            type="button"
            onClick={() => (playing ? (stop(), setPlaying(false)) : play())}
            className="grid size-7 place-items-center"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <span className="flex gap-1">
                <span className="block h-3 w-0.5 bg-white" />
                <span className="block h-3 w-0.5 bg-white" />
              </span>
            ) : (
              <span className="ml-0.5 block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
            )}
          </button>
          <span className="tabular-nums">
            {formatClock(elapsed)} / 0:13
          </span>
          <span className="ml-auto text-[11px] tracking-wide text-white/70">Machine draw</span>
        </div>
      </div>
    </div>
  );
}

export function LockedFilm() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-[#f7f8fa]">
      <div className="relative flex aspect-video items-center justify-center">
        <span
          className="grid size-14 place-items-center rounded-full border border-[#e6e8ee] bg-white"
          aria-hidden
        >
          <span className="ml-1 block h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-[#d0d5dd]" />
        </span>
        <span className="sr-only">Machine draw is locked</span>
      </div>
    </div>
  );
}

export function ForecastPost({
  forecast,
  locked,
  showVideo = true,
  href,
}: {
  forecast: Forecast;
  locked: boolean;
  showVideo?: boolean;
  href?: string;
}) {
  const game = gameById(forecast.game);
  const pills = locked ? (
    <div
      className="flex gap-1.5"
      aria-label={`${game.label} numbers are locked`}
    >
      {Array.from({ length: game.count }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'grid place-items-center rounded-full border text-[#d0d5dd]',
            showVideo
              ? 'size-[52px] border-2 text-lg'
              : 'size-7 border text-[11px]',
          )}
        >
          •
        </span>
      ))}
    </div>
  ) : (
    <NumberPills numbers={forecast.numbers} size={showVideo ? 'md' : 'xs'} />
  );

  const content = (
    <article className="border-b border-[#eef0f3] py-4">
      <div className="flex gap-3">
        <LogoMark className="mt-0.5 size-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[15px] font-semibold text-[#101828]">{SITE.name}</span>
            <span className="text-sm text-[#98a2b3]">
              {game.label} · {formatWeekdayDay(forecast.date)}
            </span>
          </div>
          <div className="mt-3">{pills}</div>
          {showVideo ? (
            <div className="mt-3">
              {locked ? <LockedFilm /> : <MachineFilm numbers={forecast.numbers} />}
            </div>
          ) : null}
          <p className="mt-3 text-[15px] leading-5 text-[#101828]">{forecast.title}</p>
        </div>
      </div>
    </article>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block transition-colors hover:bg-[#f7f8fa]">
      {content}
    </Link>
  );
}

export function ForecastArticle({
  forecast,
  locked,
}: {
  forecast: Forecast;
  locked: boolean;
}) {
  return <ForecastPost forecast={forecast} locked={locked} showVideo />;
}
