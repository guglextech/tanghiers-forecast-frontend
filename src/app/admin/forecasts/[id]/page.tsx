'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ForecastForm } from '@/components/admin/ForecastForm';
import { useDesk } from '@/components/forecast/useDesk';
import { LoadingState } from '@/components/app/LoadingState';
import { fetchForecastById } from '@/lib/desk';
import type { Forecast } from '@/data/forecasts';

export default function EditForecastPage() {
  const params = useParams<{ id: string }>();
  const desk = useDesk();
  const [fetched, setFetched] = React.useState<Forecast | null>(null);

  React.useEffect(() => {
    if (!desk) return;
    const local = desk.forecasts.find((item) => item.id === params.id) ?? null;
    if (local) {
      setFetched(local);
      return;
    }
    void fetchForecastById(params.id).then(setFetched);
  }, [desk, params.id]);

  if (!desk) return <LoadingState label="Loading forecast…" />;

  const forecast = fetched ?? desk.forecasts.find((item) => item.id === params.id);
  if (!forecast) {
    return (
      <div>
        <h1 className="text-[1.75rem] font-semibold tracking-tight">Forecast not found</h1>
        <Link href="/admin/forecasts" className="mt-4 inline-flex text-sm font-medium hover:underline">
          Back to forecasts
        </Link>
      </div>
    );
  }

  return <ForecastForm key={forecast.id} initial={forecast} />;
}
