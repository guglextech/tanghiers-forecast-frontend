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

function readForecastPage(payload: unknown): { items: Forecast[]; total: number } {
  const rows = asList<ApiForecast>(payload);
  const meta = payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as { total?: number })
    : {};
  return {
    items: rows.map(mapForecast),
    total: typeof meta.total === 'number' ? meta.total : rows.length,
  };
}

export async function fetchForecastList(query?: { limit?: number; offset?: number }): Promise<Forecast[]> {
  return readForecastPage(await forecastApi.list(query)).items;
}

export async function fetchForecastPage(query?: { limit?: number; offset?: number }) {
  return readForecastPage(await forecastApi.list(query));
}

export async function fetchAllForecasts(): Promise<Forecast[]> {
  const first = readForecastPage(await forecastApi.list());
  if (first.total <= first.items.length) return first.items;
  return readForecastPage(await forecastApi.list({ limit: first.total, offset: 0 })).items;
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
