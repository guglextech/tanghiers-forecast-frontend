import { Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PosterTone = 'blue' | 'green' | 'slate' | 'sky';

const TONES: Record<PosterTone, { bg: string; glow: string; ball: string }> = {
  blue: { bg: 'from-[#06245a] via-[#0B3A82] to-[#1d5bbf]', glow: 'bg-[#3b82f6]/40', ball: 'bg-[#2e6fd8]' },
  green: { bg: 'from-[#06301f] via-[#125d4a] to-[#1f8a6c]', glow: 'bg-[#34d399]/30', ball: 'bg-[#1f8a6c]' },
  slate: { bg: 'from-[#0f1420] via-[#344054] to-[#56627a]', glow: 'bg-[#94a3b8]/30', ball: 'bg-[#475467]' },
  sky: { bg: 'from-[#0a2b6b] via-[#175cd3] to-[#3d8bfd]', glow: 'bg-[#93c5fd]/40', ball: 'bg-[#2f74e6]' },
};

export function ForecastPoster({
  game,
  label,
  balls,
  tone,
  badge,
  size = 'md',
  className,
}: {
  game: string;
  label: string;
  balls: number;
  tone: PosterTone;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const palette = TONES[tone];
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-gradient-to-br text-white',
        palette.bg,
        size === 'sm' ? 'aspect-[16/10]' : size === 'lg' ? 'aspect-[4/3] sm:aspect-video' : 'aspect-video',
        className,
      )}
    >
      <div className={cn('absolute -top-1/3 -right-1/4 -z-10 size-3/4 rounded-full blur-3xl', palette.glow)} />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:14px_14px]" />

      <div
        className={cn(
          'absolute inset-0 flex flex-col',
          size === 'sm' ? 'justify-center px-2.5' : size === 'lg' ? 'justify-start px-5 pt-12 sm:px-8 sm:pt-[8%]' : 'justify-center px-4',
        )}
      >
        <p
          className={cn(
            'font-black leading-[0.9] tracking-tight uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]',
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl sm:text-6xl' : 'text-3xl',
          )}
        >
          {game}
        </p>
        <p
          className={cn(
            'mt-1 font-bold tracking-wide text-white/80 uppercase',
            size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-base sm:text-lg' : 'text-xs',
          )}
        >
          {label}
        </p>
        <div className={cn('flex', size === 'sm' ? 'mt-1.5 gap-1' : size === 'lg' ? 'mt-4 gap-2 sm:mt-5 sm:gap-2.5' : 'mt-3 gap-1.5')}>
          {Array.from({ length: balls }).map((_, index) => (
            <span
              key={index}
              className={cn(
                'grid place-items-center rounded-full font-bold text-white/90 ring-1 ring-white/30 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.35)]',
                palette.ball,
                size === 'sm' ? 'size-4 text-[8px]' : size === 'lg' ? 'size-9 text-sm sm:size-12 sm:text-base' : 'size-7 text-xs',
              )}
            >
              <span className="blur-[3px]">{(index * 7 + 3) % 10}</span>
            </span>
          ))}
        </div>
      </div>

      {size !== 'sm' ? (
        <span
          className={cn(
            'absolute right-[12%] grid place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm transition-transform group-hover:scale-110',
            size === 'lg' ? 'top-[30%] size-14 sm:size-16' : 'top-1/2 size-10 -translate-y-1/2',
          )}
        >
          <Play className="ml-0.5 size-5 fill-white sm:size-6" strokeWidth={0} />
        </span>
      ) : null}

      <span
        className={cn(
          'absolute flex items-center gap-1 rounded-full bg-black/45 font-semibold backdrop-blur-sm',
          size === 'sm' ? 'right-1.5 bottom-1.5 px-1.5 py-0.5 text-[8px]' : 'right-2.5 bottom-2.5 px-2 py-0.5 text-[11px]',
        )}
      >
        <Lock className={size === 'sm' ? 'size-2' : 'size-3'} strokeWidth={2.25} />
        {badge || 'Members'}
      </span>
      <span
        className={cn(
          'absolute top-2.5 left-2.5 rounded bg-white font-black tracking-tight text-[#0B3A82]',
          size === 'sm' ? 'top-1.5 left-1.5 px-1 text-[8px]' : 'px-1.5 py-0.5 text-[10px]',
        )}
      >
        TG
      </span>
    </div>
  );
}
