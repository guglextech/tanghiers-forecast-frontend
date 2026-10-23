'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Forecast } from '@/data/forecasts';
import { formatMonthYear, formatWeekdayDay } from '@/lib/dates';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { ForecastPost, NumberPills } from '@/components/forecast/ForecastArticle';
import { useForecasts } from '@/components/forecast/useForecasts';
import { fetchForecastDetail } from '@/lib/customer-forecasts';
import { SITE } from '@/data/site';

export function FeedScreen() {
  const { user, ready } = useSession();
  const { today, loaded, error } = useForecasts();

  if (!ready || !user || !loaded) return <LoadingState label="Loading the forecast…" />;

  const locked = Boolean(today?.locked);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Feed</h1>
          <p className="mt-1 text-sm text-[#667085]">{SITE.disclaimer}</p>
        </div>
        <Link href="/history" className="shrink-0 text-sm font-medium text-[#667085] hover:text-[#101828]">
          History
        </Link>
      </div>

      {error ? <p className="mt-6 text-sm text-[#b42318]">{error}</p> : null}

      {!today ? (
        <p className="mt-8 text-sm text-[#667085]">No forecast for today yet.</p>
      ) : (
        <div className="mt-6">
          <ForecastPost forecast={today} locked={locked} />
        </div>
      )}
    </div>
  );
}

export function HistoryScreen() {
  const { user, ready } = useSession();
  const { items, loaded, error } = useForecasts();

  if (!ready || !user || !loaded) return <LoadingState label="Loading history…" />;

  const groups = groupByMonth(items);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">History</h1>
          <p className="mt-1 text-sm text-[#667085]">
            {items.length === 0 ? 'No published forecasts yet.' : `${items.length} published`}
          </p>
        </div>
        <Link href="/feed" className="shrink-0 text-sm font-medium text-[#667085] hover:text-[#101828]">
          Today
        </Link>
      </div>

      {error ? <p className="mt-6 text-sm text-[#b42318]">{error}</p> : null}

      {items.length === 0 ? null : (
        <div className="mt-6 overflow-hidden rounded-[28px] bg-[#f4f6f8]">
          {groups.map((group) => (
            <section key={group.month} className="border-t border-white first:border-t-0">
              <h2 className="px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-[#98a2b3] uppercase">
                {group.label}
              </h2>
              <ul>
                {group.items.map((forecast) => {
                  const locked = Boolean(forecast.locked);
                  return (
                    <li key={forecast.id} className="border-t border-white">
                      <Link
                        href={`/forecasts/${forecast.id}`}
                        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/70 sm:gap-4"
                      >
                        <span className="w-[4.5rem] shrink-0 whitespace-nowrap text-sm tabular-nums text-[#667085]">
                          {formatWeekdayDay(forecast.date)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[#101828]">{forecast.title}</span>
                          {locked ? (
                            <span className="mt-0.5 block text-sm text-[#98a2b3]">Locked</span>
                          ) : forecast.numbers.length ? (
                            <span className="mt-1 block">
                              <NumberPills numbers={forecast.numbers} size="xs" />
                            </span>
                          ) : null}
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-[#d0d5dd] transition-colors group-hover:text-[#667085]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByMonth(forecasts: Forecast[]) {
  const groups: { month: string; label: string; items: Forecast[] }[] = [];
  for (const forecast of forecasts) {
    const month = forecast.date.slice(0, 7) || 'unknown';
    const last = groups[groups.length - 1];
    if (last?.month === month) {
      last.items.push(forecast);
    } else {
      groups.push({
        month,
        label: forecast.date ? formatMonthYear(forecast.date) : 'Forecasts',
        items: [forecast],
      });
    }
  }
  return groups;
}

export function ForecastScreen({ id }: { id: string }) {
  const { user, ready } = useSession();
  const [forecast, setForecast] = React.useState<Forecast | null>(null);
  const [locked, setLocked] = React.useState(false);
  const [missing, setMissing] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    void fetchForecastDetail(id)
      .then((result) => {
        if (cancelled) return;
        setForecast(result.forecast);
        setLocked(result.locked);
        setMissing(result.missing);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setForecast(null);
        setMissing(true);
        setError(err instanceof Error ? err.message : 'Could not load this forecast.');
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!ready || !user || !loaded) return <LoadingState label="Loading the forecast…" />;

  if (missing || !forecast) {
    return (
      <div>
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Forecast</h1>
        <p className="mt-3 text-sm leading-6 text-[#667085]">
          {error || 'This forecast is not published.'}
        </p>
        <Link href="/history" className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline">
          All forecasts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ForecastPost forecast={forecast} locked={locked || Boolean(forecast.locked)} />
      <p className="pt-5 text-sm">
        <Link href="/history" className="font-medium text-[#667085] hover:text-[#101828]">
          All forecasts
        </Link>
      </p>
    </div>
  );
}
