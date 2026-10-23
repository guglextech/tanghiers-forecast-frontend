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
  className,
}: {
  videoId?: string;
  title: string;
  locked?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = React.useState(false);
  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className={cn('group/video relative overflow-hidden bg-[#0b1220]', className)}>
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
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            {locked ? (
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid size-12 place-items-center rounded-full bg-white/90 text-[#101828]">
                  <span className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-[#d0d5dd]" />
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
                <span className="grid size-12 place-items-center rounded-full bg-white text-[#101828]">
                  <span className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-[#101828]" />
                </span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
