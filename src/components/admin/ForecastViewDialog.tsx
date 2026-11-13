'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarDays, Loader2, MessageCircle, Play } from '@/components/ui/icons';
import { admin } from '@/lib/api/resources';
import { mapForecast } from '@/lib/api/mappers';
import type { Forecast } from '@/data/forecasts';
import { formatDeskDate, formatDeskStamp } from '@/lib/dates';
import { Pill, toneFor } from '@/components/admin/desk-ui';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';

type Detail = { forecast: Forecast; accessLevel: string | null; updatedAt: string | null };

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[#98a2b3]">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-[#101828]">{value}</dd>
    </div>
  );
}

export function ForecastViewDialog({
  forecastId,
  open,
  onOpenChange,
}: {
  forecastId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setDetail(null);
    setError('');
    admin
      .forecast(forecastId)
      .then((row) => {
        if (cancelled) return;
        setDetail({
          forecast: mapForecast(row),
          accessLevel: row.accessLevel ?? null,
          updatedAt: row.updatedAt ?? null,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this forecast.');
      });
    return () => {
      cancelled = true;
    };
  }, [forecastId, open]);

  const forecast = detail?.forecast;
  const fields = forecast?.fields ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 border-l-0 p-0 sm:max-w-xl">
        {!forecast ? (
          <div className="grid flex-1 place-items-center p-6">
            <SheetTitle className="sr-only">Forecast</SheetTitle>
            <SheetDescription className="sr-only">Forecast details</SheetDescription>
            {error ? (
              <p className="text-sm text-[#b42318]">{error}</p>
            ) : (
              <Loader2 className="size-5 animate-spin text-[#98a2b3]" />
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-start gap-3 border-b border-[#eef0f3] px-6 py-5 pr-12">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eef4ff] text-[#0B3A82]">
                <CalendarDays className="size-5" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="truncate text-lg font-semibold tracking-tight text-[#101828]">
                  {forecast.title}
                </SheetTitle>
                <SheetDescription className="mt-1 text-sm text-[#667085]">
                  {forecast.date ? formatDeskDate(forecast.date) : 'No draw date'}
                </SheetDescription>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill tone={toneFor(forecast.status)}>{titleCase(forecast.status)}</Pill>
                  {detail.accessLevel ? (
                    <span className="inline-flex rounded-full bg-[#f4f3ff] px-2 py-0.5 text-[11px] font-medium text-[#5925dc]">
                      {titleCase(detail.accessLevel)}
                    </span>
                  ) : null}
                  {forecast.hasVideo ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#eff8ff] px-2 py-0.5 text-[11px] font-medium text-[#175cd3]">
                      <Play className="size-3" />
                      Video
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {forecast.videoId ? (
                <div className="aspect-video overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${forecast.videoId}`}
                    title={`${forecast.title} video`}
                    className="size-full"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}

              {forecast.message ? (
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#667085] uppercase">
                    <MessageCircle className="size-3.5" />
                    Message
                  </h3>
                  <p className="border-l-2 border-[#0B3A82] pl-3 text-sm leading-6 whitespace-pre-line text-[#344054]">
                    {forecast.message}
                  </p>
                </section>
              ) : null}

              <section>
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-[#667085] uppercase">Forecast content</h3>
                {fields.length ? (
                  <dl className="divide-y divide-[#f2f4f7] rounded-xl border border-[#e4e7ec]">
                    {fields.map((field) => (
                      <div key={field.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
                        <dt className="text-sm text-[#667085]">{field.label}</dt>
                        <dd className="min-w-0 text-sm font-medium text-[#101828]">
                          {field.type === 'numbers' ? (
                            field.numbers.length ? (
                              <span className="flex flex-wrap gap-1.5">
                                {field.numbers.map((value, index) => (
                                  <span
                                    key={`${field.key}-${index}`}
                                    className="grid size-8 place-items-center rounded-full border border-[#e4e7ec] bg-white text-xs font-semibold tabular-nums"
                                  >
                                    {String(value).padStart(2, '0')}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="text-[#98a2b3]">Not set</span>
                            )
                          ) : (
                            <span className="whitespace-pre-line">{field.text || '—'}</span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-[#98a2b3]">No content fields.</p>
                )}
              </section>

              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Meta label="Published" value={forecast.publishAt ? formatDeskStamp(forecast.publishAt) : 'Not yet'} />
                <Meta label="Last updated" value={detail.updatedAt ? formatDeskStamp(detail.updatedAt) : '—'} />
                <Meta label="Version" value={forecast.version ?? '—'} />
              </dl>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#eef0f3] px-6 py-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 items-center rounded-lg border border-[#d0d5dd] bg-white px-3.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb]"
              >
                Close
              </button>
              <Link
                href={`/admin/forecasts/${forecast.id}`}
                className="inline-flex h-9 items-center rounded-lg bg-[#0B3A82] px-3.5 text-sm font-semibold text-white hover:bg-[#092d66]"
              >
                Edit forecast
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
