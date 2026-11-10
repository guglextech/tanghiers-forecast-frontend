import Image from 'next/image';
import { Lock, Play } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export type PosterTone = 'blue' | 'green' | 'slate' | 'sky';

const TONES: Record<PosterTone, { bg: string; glow: string }> = {
  blue: { bg: 'from-[#06245a] via-[#0B3A82] to-[#1d5bbf]', glow: 'bg-[#3b82f6]/40' },
  green: { bg: 'from-[#06301f] via-[#125d4a] to-[#1f8a6c]', glow: 'bg-[#34d399]/30' },
  slate: { bg: 'from-[#0f1420] via-[#344054] to-[#56627a]', glow: 'bg-[#94a3b8]/30' },
  sky: { bg: 'from-[#0a2b6b] via-[#175cd3] to-[#3d8bfd]', glow: 'bg-[#93c5fd]/40' },
};

export function ForecastPoster({
  game,
  label,
  balls,
  tone,
  image,
  priority = false,
  badge,
  size = 'md',
  className,
}: {
  game: string;
  label: string;
  balls: number;
  tone: PosterTone;
  image?: string;
  priority?: boolean;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const palette = TONES[tone];
  return (
    <div
      aria-hidden
      className={cn(
        'relative isolate overflow-hidden bg-gradient-to-br text-white',
        palette.bg,
        size === 'sm' ? 'aspect-[16/10]' : size === 'lg' ? 'aspect-[4/3] sm:aspect-video' : 'aspect-video',
        className,
      )}
    >
      {image ? (
        <>
          <Image
            src={image}
            alt=""
            fill
            priority={priority}
            sizes={
              size === 'lg'
                ? '(min-width: 672px) 672px, 100vw'
                : size === 'sm'
                  ? '128px'
                  : '(min-width: 672px) 330px, 50vw'
            }
            className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#040d22]/85 via-[#040d22]/45 to-[#040d22]/10" />
        </>
      ) : (
        <>
          <div className={cn('absolute -top-1/3 -right-1/4 -z-10 size-3/4 rounded-full blur-3xl', palette.glow)} />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:14px_14px]" />
        </>
      )}

      <div
        className={cn(
          'absolute inset-0 flex flex-col',
          size === 'sm'
            ? 'justify-center px-3'
            : size === 'lg'
              ? 'justify-start px-5 pt-12 sm:px-8 sm:pt-[8%]'
              : 'justify-center px-3 sm:px-4',
        )}
      >
        <p
          className={cn(
            'font-black leading-[0.9] tracking-tight uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]',
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl sm:text-6xl' : 'text-2xl sm:text-3xl',
          )}
        >
          {game}
        </p>
        <p
          className={cn(
            'mt-1 font-bold tracking-wide text-white/80 uppercase',
            size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-base sm:text-lg' : 'text-[10px] sm:text-xs',
          )}
        >
          {label}
        </p>
        <div
          className={cn(
            'flex',
            size === 'sm'
              ? 'mt-1.5 gap-1'
              : size === 'lg'
                ? 'mt-4 gap-2 sm:mt-5 sm:gap-2.5'
                : 'mt-2 gap-1 sm:mt-3 sm:gap-1.5',
          )}
        >
          {Array.from({ length: balls }).map((_, index) => (
            <span
              key={index}
              className={cn(
                'grid place-items-center rounded-full bg-white font-bold text-[#0B3A82] shadow-[inset_0_-3px_6px_rgba(16,24,40,0.15),0_2px_6px_rgba(0,0,0,0.25)]',
                size === 'sm'
                  ? 'size-4 text-[8px]'
                  : size === 'lg'
                    ? 'size-9 text-sm sm:size-12 sm:text-base'
                    : 'size-5 text-[9px] sm:size-7 sm:text-xs',
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
            size === 'lg'
              ? 'top-12 size-12 sm:top-[22%] sm:size-16'
              : 'top-1/2 hidden size-10 -translate-y-1/2 sm:grid',
          )}
        >
          <Play className="ml-0.5 size-5 fill-white sm:size-6" strokeWidth={0} />
        </span>
      ) : null}

      {size === 'sm' ? (
        <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-black/45 backdrop-blur-sm">
          <Lock className="size-2.5" strokeWidth={2.25} />
        </span>
      ) : (
        <>
          <span
            className={cn(
              'absolute flex items-center gap-1 rounded-full bg-black/45 font-semibold backdrop-blur-sm',
              size === 'lg'
                ? 'top-2.5 right-2.5 px-2 py-0.5 text-[11px]'
                : 'top-2 right-2 p-1.5 sm:top-auto sm:right-2.5 sm:bottom-2.5 sm:px-2 sm:py-0.5 sm:text-[11px]',
            )}
          >
            <Lock className="size-3" strokeWidth={2.25} />
            <span className={size === 'lg' ? '' : 'hidden sm:inline'}>{badge || 'Members'}</span>
          </span>
          <span
            className={cn(
              'absolute top-2.5 left-2.5 rounded bg-white px-1.5 py-0.5 text-[10px] font-black tracking-tight text-[#0B3A82]',
              size === 'lg' ? '' : 'hidden sm:block',
            )}
          >
            LF
          </span>
        </>
      )}
    </div>
  );
}
