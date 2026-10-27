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
            size === 'xs' && 'size-6 border border-[#101828] text-[10px]',
            size === 'sm' && 'size-8 border border-[#101828] text-xs',
            size === 'md' && 'size-8 border border-[#101828] text-xs',
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
            size === 'xs' && 'size-6 text-[10px]',
            size === 'md' && 'size-8 text-xs',
          )}
        >
          •
        </span>
      ))}
    </div>
  );
}

function FieldRow({
  field,
  locked,
  compact,
}: {
  field: ForecastField;
  locked: boolean;
  compact?: boolean;
}) {
  const count = LOCKED_COUNTS[field.key] ?? Math.max(field.numbers.length, 1);
  const pillSize = compact ? 'xs' : 'md';

  return (
    <div className={cn('flex items-center justify-between gap-3', compact ? 'py-1.5' : 'py-2')}>
      <p className="shrink-0 text-xs text-[#667085]">{field.label}</p>
      {field.type === 'text' ? (
        locked ? (
          <p className="text-xs tabular-nums text-[#d0d5dd]">••••••</p>
        ) : (
          <p className="text-xs font-medium tabular-nums text-[#101828]">{field.text}</p>
        )
      ) : locked ? (
        <LockedPills count={count} size={pillSize} />
      ) : (
        <NumberPills numbers={field.numbers} size={pillSize} />
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
  compact = false,
}: {
  forecast: Forecast;
  locked: boolean;
  subscribeHref?: string;
  compact?: boolean;
}) {
  const videoId = locked ? null : forecast.videoId || youtubeIdFromUrl(forecast.videoUrl);
  const fields = fieldsFor(forecast, locked);
  const showVideo = locked ? Boolean(forecast.hasVideo) : Boolean(videoId);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#f4f6f8]">
      {showVideo ? (
        locked ? (
          <div className="grid aspect-video place-items-center bg-[#eceef2]">
            <p className="text-xs text-[#98a2b3]">Draw video is locked</p>
          </div>
        ) : videoId ? (
          <YoutubeFrame title={`${forecast.title} draw`} videoId={videoId} />
        ) : null
      ) : null}

      <div className={cn('flex-1', compact ? 'px-3 py-3' : 'px-4 py-4')}>
        <p className="text-xs text-[#98a2b3]">
          {forecast.date ? formatWeekdayDay(forecast.date) : 'Forecast'}
        </p>
        <h2 className={cn('mt-0.5 font-semibold tracking-tight text-[#101828]', compact ? 'text-sm' : 'text-base')}>
          {forecast.title || (forecast.date ? formatLongDate(forecast.date) : 'Today')}
        </h2>

        {fields.length ? (
          <div className={cn('divide-y divide-[#e6e8ee]', compact ? 'mt-2' : 'mt-3')}>
            {fields.map((field) => (
              <FieldRow key={field.key} field={field} locked={locked} compact={compact} />
            ))}
          </div>
        ) : null}

        {!locked && forecast.message ? (
          <p className="mt-3 text-xs leading-5 text-[#667085]">{forecast.message}</p>
        ) : null}

        {locked ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={subscribeHref}
              className="inline-flex h-8 items-center rounded-[var(--radius)] bg-[#101828] px-3.5 text-xs font-semibold text-white hover:bg-[#1d2939]"
            >
              Subscribe
            </Link>
            <p className="text-xs text-[#667085]">Open the numbers and the draw.</p>
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
