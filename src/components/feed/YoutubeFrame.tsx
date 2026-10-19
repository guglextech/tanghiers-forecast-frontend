'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const SAMPLE_YOUTUBE_ID = 'GymyHmEjBxI';

function embedSrc(id: string) {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    iv_load_policy: '3',
    cc_load_policy: '0',
    controls: '1',
    fs: '1',
    autoplay: '1',
    mute: '0',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function YoutubeFrame({
  videoId = SAMPLE_YOUTUBE_ID,
  title,
  locked = false,
}: {
  videoId?: string;
  title: string;
  locked?: boolean;
}) {
  const [playing, setPlaying] = React.useState(false);
  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="group/video relative overflow-hidden rounded-2xl bg-[#0b1220]">
      <div className="relative aspect-video">
        {playing && !locked ? (
          <iframe
            className="absolute inset-0 h-full w-full border-0"
            src={embedSrc(videoId)}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <>
            <Image
              src={poster}
              alt=""
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover transition duration-500 ease-out group-hover/video:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
            {locked ? (
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid size-14 place-items-center rounded-full border border-white/20 bg-white/90 text-[#101828] shadow-lg">
                  <span className="ml-1 block h-0 w-0 border-y-[8px] border-l-[14px] border-y-transparent border-l-[#d0d5dd]" />
                </span>
                <span className="sr-only">Draw video is locked</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute inset-0 grid place-items-center"
                aria-label={`Play ${title}`}
              >
                <span
                  className={cn(
                    'grid size-14 place-items-center rounded-full bg-white text-[#101828] shadow-lg',
                    'transition duration-300 ease-out group-hover/video:scale-110',
                  )}
                >
                  <span className="ml-1 block h-0 w-0 border-y-[8px] border-l-[14px] border-y-transparent border-l-[#101828]" />
                </span>
              </button>
            )}
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/90">
              Draw video
            </span>
          </>
        )}
      </div>
    </div>
  );
}
