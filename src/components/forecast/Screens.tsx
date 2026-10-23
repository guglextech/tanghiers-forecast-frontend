'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Forecast } from '@/data/forecasts';
import { formatMonthYear, formatWeekdayDay } from '@/lib/dates';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { ForecastPost } from '@/components/forecast/ForecastArticle';
import { useForecasts } from '@/components/forecast/useForecasts';
import { fetchForecastDetail } from '@/lib/customer-forecasts';
import { SITE } from '@/data/site';

export function FeedScreen() {
  const { user, ready } = useSession();
  const { items, loaded, error } = useForecasts();

  if (!ready || !user || !loaded) return <LoadingState label="Loading the forecast…" />;

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

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-[#667085]">No forecasts yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((forecast) => (
            <ForecastPost
              key={forecast.id}
              forecast={forecast}
              locked={Boolean(forecast.locked)}
              compact
            />
          ))}
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
            {items.length === 0 ? 'No published forecasts yet.' : 'Past forecasts'}
          </p>
        </div>
        <Link href="/feed" className="shrink-0 text-sm font-medium text-[#667085] hover:text-[#101828]">
          Today
        </Link>
      </div>

      {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}

      {items.length === 0 ? null : (
        <div className="mt-4 space-y-5">
          {groups.map((group) => (
            <section key={group.month}>
              <h2 className="mb-2 text-xs text-[#98a2b3]">{group.label}</h2>
              <ul className="overflow-hidden rounded-2xl bg-[#f4f6f8]">
                {group.items.map((forecast) => {
                  const locked = Boolean(forecast.locked);
                  const numbers = forecast.numbers.join(' · ');
                  return (
                    <li key={forecast.id} className="border-t border-white first:border-t-0">
                      <Link
                        href={`/forecasts/${forecast.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/60"
                      >
                        <span className="w-[3.75rem] shrink-0 text-xs tabular-nums text-[#98a2b3]">
                          {formatWeekdayDay(forecast.date)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#101828]">
                          {forecast.title}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-[#667085]">
                          {locked ? 'Locked' : numbers || '—'}
                        </span>
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
