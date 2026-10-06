'use client';

import * as React from 'react';
import Link from 'next/link';
import { gameById, type Forecast } from '@/data/forecasts';
import { formatForecastDate } from '@/lib/dates';
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
      <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-medium text-[#101828]">Machine video is part of the subscription</p>
        <p className="max-w-sm text-sm leading-6 text-[#667085]">
          Active subscribers can play the draw attached to each forecast.
        </p>
        <Link
          href="/pricing"
          className="inline-flex h-10 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white"
        >
          See plans
        </Link>
      </div>
    </div>
  );
}

export function ForecastArticle({
  forecast,
  locked,
}: {
  forecast: Forecast;
  locked: boolean;
}) {
  const game = gameById(forecast.game);

  return (
    <article>
      <p className="text-[13px] font-medium tracking-[0.12em] text-[#98a2b3]">
        {formatForecastDate(forecast.date)}
      </p>
      <div className="mt-4">
        {locked ? (
          <div className="flex gap-3" aria-label={`${game.label} numbers are locked`}>
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
        )}
      </div>
      <div className="mt-6">{locked ? <LockedFilm /> : <MachineFilm numbers={forecast.numbers} />}</div>
      <h2 className="mt-4 text-[15px] font-medium text-[#101828]">{forecast.title}</h2>
    </article>
  );
}
