'use client';

import * as React from 'react';
import { useSession } from '@/components/app/SessionProvider';
import { fetchAllForecasts, fetchForecastList } from '@/lib/customer-forecasts';
import type { Forecast } from '@/data/forecasts';

export function useForecasts(query?: { limit?: number; offset?: number }) {
  const { ready } = useSession();
  const [items, setItems] = React.useState<Forecast[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState('');
  const limit = query?.limit;
  const offset = query?.offset;
  const paged = limit != null || offset != null;

  React.useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    const load = paged ? fetchForecastList({ limit, offset }) : fetchAllForecasts();

    void load
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setError(err instanceof Error ? err.message : 'Could not load forecasts.');
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, limit, offset, paged]);

  return { items, loaded, error };
}
