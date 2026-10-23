'use client';

import * as React from 'react';
import { useSession } from '@/components/app/SessionProvider';
import { fetchForecastList, fetchTodayForecast } from '@/lib/customer-forecasts';
import type { Forecast } from '@/data/forecasts';

export function useForecasts() {
  const { ready } = useSession();
  const [today, setToday] = React.useState<Forecast | null>(null);
  const [items, setItems] = React.useState<Forecast[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    void Promise.all([fetchForecastList(), fetchTodayForecast()])
      .then(([list, current]) => {
        if (cancelled) return;
        setItems(list);
        setToday(current);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setToday(null);
        setError(err instanceof Error ? err.message : 'Could not load forecasts.');
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  return { today, items, loaded, error };
}
