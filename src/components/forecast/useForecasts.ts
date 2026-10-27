'use client';

import * as React from 'react';
import { useSession } from '@/components/app/SessionProvider';
import { fetchAllForecasts, fetchForecastPage } from '@/lib/customer-forecasts';
import type { Forecast } from '@/data/forecasts';

export function useForecasts(query?: { limit?: number; offset?: number }) {
  const { ready } = useSession();
  const [items, setItems] = React.useState<Forecast[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState('');
  const limit = query?.limit;
  const offset = query?.offset;
  const paged = limit != null || offset != null;

  React.useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    const load = paged
      ? fetchForecastPage({ limit, offset })
      : fetchAllForecasts().then((list) => ({ items: list, total: list.length }));

    void load
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : 'Could not load forecasts.');
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, limit, offset, paged]);

  return { items, total, loaded, error };
}
