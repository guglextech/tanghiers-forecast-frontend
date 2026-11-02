'use client';

import Link from 'next/link';
import type { Forecast, ForecastField } from '@/data/forecasts';
import { formatLongDate, formatWeekdayDay } from '@/lib/dates';
import { YoutubeFrame } from '@/components/feed/YoutubeFrame';
import { youtubeIdFromUrl } from '@/lib/api/mappers';
import { cn } from '@/lib/utils';

const HIDDEN_FIELDS = new Set(['banker', 'twosure', 'threedirect']);

function isHiddenField(key: string) {
  return HIDDEN_FIELDS.has(key.replace(/[\s_-]/g, '').toLowerCase());
}

function displayField(field: ForecastField): ForecastField {
  const key = field.key.replace(/[\s_-]/g, '').toLowerCase();
  const label = field.label.replace(/[\s_-]/g, '').toLowerCase();
  if (key === 'permutations' || key === 'permutation' || label === 'permutations' || label === 'permutation') {
    return { ...field, label: 'Forecast message', type: 'text' };
  }
  return field;
}

function fieldsFor(forecast: Forecast, locked: boolean): ForecastField[] {
  const source = forecast.fields?.length
    ? forecast.fields
    : forecast.body?.permutations
      ? [{ key: 'permutations', label: 'Forecast message', type: 'text' as const, numbers: [], text: forecast.body.permutations }]
      : [];
  const visible = source.filter((field) => !isHiddenField(field.key)).map(displayField);
  if (locked && !visible.length) {
    return [{ key: 'permutations', label: 'Forecast message', type: 'text', numbers: [], text: '' }];
  }
  return visible;
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
          <div className={cn('space-y-3', compact ? 'mt-2' : 'mt-3')}>
            {fields.map((field) => (
              <div key={field.key}>
                <p className="text-xs text-[#667085]">{field.label}</p>
                <p
                  className={cn(
                    'mt-1 whitespace-pre-wrap text-sm leading-5',
                    locked || !field.text ? 'text-[#d0d5dd]' : 'text-[#101828]',
                  )}
                >
                  {locked || !field.text ? 'Locked' : field.text}
                </p>
              </div>
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
            <p className="text-xs text-[#667085]">Open the forecast and the draw.</p>
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
