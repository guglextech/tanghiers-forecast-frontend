'use client';

import Link from 'next/link';
import type { Forecast, ForecastField } from '@/data/forecasts';
import { formatLongDate, formatWeekdayDay } from '@/lib/dates';
import { YoutubeFrame } from '@/components/feed/YoutubeFrame';
import { youtubeIdFromUrl } from '@/lib/api/mappers';
import { cn } from '@/lib/utils';

const LOCKED_FIELDS: ForecastField[] = [
  { key: 'banker', label: 'Banker', type: 'numbers', numbers: [], text: '' },
  { key: 'twoSure', label: 'Two Sure', type: 'numbers', numbers: [], text: '' },
  { key: 'threeDirect', label: 'Three Direct', type: 'numbers', numbers: [], text: '' },
];

const LOCKED_COUNTS: Record<string, number> = {
  banker: 1,
  twoSure: 2,
  threeDirect: 3,
};

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
    <div className={cn('flex flex-wrap', size === 'md' ? 'gap-2' : 'gap-1.5', className)}>
      {numbers.map((number, index) => (
        <span
          key={`${number}-${index}`}
          className={cn(
            'grid place-items-center rounded-full font-semibold tabular-nums text-[#101828]',
            size === 'xs' && 'size-7 border border-[#101828] text-[11px]',
            size === 'sm' && 'size-9 border border-[#101828] text-sm',
            size === 'md' && 'size-10 border border-[#101828] text-sm',
          )}
        >
          {number}
        </span>
      ))}
    </div>
  );
}

function LockedPills({ count, size = 'md' }: { count: number; size?: 'xs' | 'md' }) {
  return (
    <div className="flex gap-1.5" aria-label="Numbers are locked">
      {Array.from({ length: Math.max(count, 1) }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'grid place-items-center rounded-full border border-[#d0d5dd] text-[#d0d5dd]',
            size === 'xs' && 'size-7 text-[11px]',
            size === 'md' && 'size-10 text-sm',
          )}
        >
          •
        </span>
      ))}
    </div>
  );
}

function FieldRow({ field, locked }: { field: ForecastField; locked: boolean }) {
  const count = LOCKED_COUNTS[field.key] ?? Math.max(field.numbers.length, 1);

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <p className="shrink-0 text-sm text-[#667085]">{field.label}</p>
      {field.type === 'text' ? (
        locked ? (
          <p className="text-sm tabular-nums text-[#d0d5dd]">••••••</p>
        ) : (
          <p className="text-sm font-medium tabular-nums text-[#101828]">{field.text}</p>
        )
      ) : locked ? (
        <LockedPills count={count} />
      ) : (
        <NumberPills numbers={field.numbers} />
      )}
    </div>
  );
}

function fieldsFor(forecast: Forecast, locked: boolean): ForecastField[] {
  if (forecast.fields?.length) return forecast.fields;
  if (locked) return LOCKED_FIELDS;
  const body = forecast.body;
  if (!body) return [];
  const fields: ForecastField[] = [];
  if (body.banker.length) {
    fields.push({ key: 'banker', label: 'Banker', type: 'numbers', numbers: body.banker, text: body.banker.join('-') });
  }
  if (body.twoSure.length) {
    fields.push({ key: 'twoSure', label: 'Two Sure', type: 'numbers', numbers: body.twoSure, text: body.twoSure.join('-') });
  }
  if (body.threeDirect.length) {
    fields.push({
      key: 'threeDirect',
      label: 'Three Direct',
      type: 'numbers',
      numbers: body.threeDirect,
      text: body.threeDirect.join('-'),
    });
  }
  if (body.permutations) {
    fields.push({ key: 'permutations', label: 'Permutations', type: 'text', numbers: [], text: body.permutations });
  }
  return fields;
}

export function ForecastPost({
  forecast,
  locked,
  subscribeHref = '/pricing',
}: {
  forecast: Forecast;
  locked: boolean;
  subscribeHref?: string;
}) {
  const videoId = locked ? null : forecast.videoId || youtubeIdFromUrl(forecast.videoUrl);
  const fields = fieldsFor(forecast, locked);
  const showVideo = locked ? Boolean(forecast.hasVideo) : Boolean(videoId);

  return (
    <article className="overflow-hidden rounded-[28px] bg-[#f4f6f8]">
      {showVideo ? (
        locked ? (
          <div className="grid aspect-video place-items-center bg-[#eceef2]">
            <p className="text-sm text-[#98a2b3]">Draw video is locked</p>
          </div>
        ) : videoId ? (
          <YoutubeFrame title={`${forecast.title} draw`} videoId={videoId} />
        ) : null
      ) : null}

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-sm text-[#98a2b3]">
          {forecast.date ? formatWeekdayDay(forecast.date) : 'Forecast'}
        </p>
        <h2 className="mt-0.5 text-[1.25rem] font-semibold tracking-tight text-[#101828]">
          {forecast.title || (forecast.date ? formatLongDate(forecast.date) : 'Today')}
        </h2>

        {fields.length ? (
          <div className="mt-4 divide-y divide-[#e6e8ee]">
            {fields.map((field) => (
              <FieldRow key={field.key} field={field} locked={locked} />
            ))}
          </div>
        ) : null}

        {!locked && forecast.message ? (
          <p className="mt-4 text-sm leading-6 text-[#667085]">{forecast.message}</p>
        ) : null}

        {locked ? (
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href={subscribeHref}
              className="inline-flex h-10 items-center rounded-full bg-[#101828] px-5 text-sm font-semibold text-white hover:bg-[#1d2939]"
            >
              Subscribe
            </Link>
            <p className="text-sm text-[#667085]">Open the numbers and the draw.</p>
          </div>
        ) : null}
      </div>
    </article>
  );
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
