import { asList, forecasts as forecastApi } from '@/lib/api/resources';
import { mapForecast } from '@/lib/api/mappers';
import { ApiError } from '@/lib/api/errors';
import type { ApiForecast } from '@/lib/api/types';
import type { Forecast } from '@/data/forecasts';

function asForecast(value: unknown): ApiForecast | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as ApiForecast;
  if (record.id) return record;
  return asList<ApiForecast>(value)[0] ?? null;
}

export async function fetchForecastList(): Promise<Forecast[]> {
  const rows = asList<ApiForecast>(await forecastApi.list());
  return rows.map(mapForecast);
}

export async function fetchTodayForecast(): Promise<Forecast | null> {
  const row = asForecast(await forecastApi.today());
  return row ? mapForecast(row) : null;
}

export async function fetchForecastDetail(id: string): Promise<{
  forecast: Forecast | null;
  locked: boolean;
  missing: boolean;
}> {
  try {
    const row = asForecast(await forecastApi.get(id));
    if (!row) return { forecast: null, locked: false, missing: true };
    const forecast = mapForecast(row);
    return { forecast, locked: Boolean(forecast.locked), missing: false };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.code === 'SUBSCRIPTION_REQUIRED')) {
      const list = await fetchForecastList().catch(() => []);
      const forecast = list.find((item) => item.id === id) ?? null;
      return { forecast, locked: true, missing: false };
    }
    if (err instanceof ApiError && (err.status === 404 || err.code === 'NOT_FOUND')) {
      return { forecast: null, locked: false, missing: true };
    }
    throw err;
  }
}
