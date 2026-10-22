import { type Delivery, type Forecast } from '@/data/forecasts';
import { admin, asList, forecasts as forecastApi, me } from '@/lib/api/resources';
import { PRODUCT_SLUG } from '@/lib/api/config';
import { forecastBodyFrom, mapDelivery, mapForecast } from '@/lib/api/mappers';
import { readSession } from '@/lib/session';
import type { ApiForecast, ApiNotification } from '@/lib/api/types';
 
export type DeskState = {
  forecasts: Forecast[];
  deliveries: Delivery[];
};

export type ForecastDraft = {
  id?: string;
  title: string;
  date: string;
  banker: number[];
  twoSure: number[];
  threeDirect: number[];
  permutations?: string;
  message?: string;
  videoUrl?: string;
  publishAt?: string | null;
};

const listeners = new Set<() => void>();
let cache: DeskState = { forecasts: [], deliveries: [] };

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeDesk(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readDesk(): DeskState {
  return cache;
}

async function loadCustomerDesk(): Promise<DeskState> {
  const [list, today, notes] = await Promise.all([
    forecastApi.list().catch(() => []),
    forecastApi.today().catch(() => null),
    me.notifications().catch(() => []),
  ]);
  const rows = asList<ApiForecast>(list);
  if (today && !rows.some((row) => row.id === today.id)) rows.unshift(today);
  return {
    forecasts: rows.map(mapForecast).sort(byDate),
    deliveries: asList<ApiNotification>(notes).map(mapDelivery).sort((a, b) => b.at.localeCompare(a.at)),
  };
}

async function loadAdminDesk(): Promise<DeskState> {
  const rows = asList<ApiForecast>(await admin.forecasts());
  const forecasts = rows.map(mapForecast).sort(byDate);
  const published = forecasts.filter((item) => item.status === 'published').slice(0, 12);
  const groups = await Promise.all(
    published.map(async (forecast) => {
      try {
        return asList<ApiNotification>(await admin.deliveryMessages(forecast.id)).map(mapDelivery);
      } catch {
        return [] as Delivery[];
      }
    }),
  );
  return {
    forecasts,
    deliveries: groups.flat().sort((a, b) => b.at.localeCompare(a.at)),
  };
}

function byDate(a: Forecast, b: Forecast) {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

async function loadPublicDesk(): Promise<DeskState> {
  try {
    const rows = asList<ApiForecast>(await forecastApi.listPublic());
    return { forecasts: rows.map(mapForecast).sort(byDate), deliveries: [] };
  } catch {
    return { forecasts: [], deliveries: [] };
  }
}

export async function loadDesk(): Promise<DeskState> {
  const user = readSession();
  if (!user) {
    cache = await loadPublicDesk();
    emit();
    return cache;
  }
  cache = user.role === 'admin' ? await loadAdminDesk() : await loadCustomerDesk();
  emit();
  return cache;
}

function parseGroup(values: number[], count: number, label: string) {
  if (values.length !== count || values.some((value) => !Number.isInteger(value) || value < 0 || value > 99)) {
    throw new Error(`Enter ${count} ${label} number${count === 1 ? '' : 's'}, each from 0 to 99.`);
  }
  return values;
}

function validateDraft(input: ForecastDraft) {
  const title = input.title.trim();
  if (!title) throw new Error('Add a title.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Choose the forecast date.');
  return {
    title,
    banker: parseGroup(input.banker, 1, 'banker'),
    twoSure: parseGroup(input.twoSure, 2, 'two sure'),
    threeDirect: parseGroup(input.threeDirect, 3, 'three direct'),
  };
}

export async function saveForecast(input: ForecastDraft, mode: 'draft' | 'publish' | 'schedule'): Promise<Forecast> {
  const parsed = validateDraft(input);
  if (mode === 'schedule' && !input.publishAt) {
    throw new Error('Choose a date and time to schedule publication.');
  }
  const payload = {
    productSlug: PRODUCT_SLUG,
    drawDate: input.date,
    title: parsed.title,
    body: forecastBodyFrom({
      banker: parsed.banker,
      twoSure: parsed.twoSure,
      threeDirect: parsed.threeDirect,
      permutations: input.permutations,
    }),
    message: (input.message ?? 'Play responsibly.').trim() || 'Play responsibly.',
    videoUrl: input.videoUrl?.trim() || 'https://www.youtube.com/watch?v=GymyHmEjBxI',
    accessLevel: 'PREMIUM',
  };

  let saved: ApiForecast;
  if (input.id) {
    const current = cache.forecasts.find((item) => item.id === input.id);
    saved = await admin.updateForecast(input.id, {
      version: current?.version ?? 1,
      ...payload,
    });
  } else {
    saved = await admin.createForecast(payload);
  }

  const version = saved.version ?? 1;
  if (mode === 'publish') {
    saved = await admin.publishForecast(saved.id, version);
  } else if (mode === 'schedule' && input.publishAt) {
    saved = await admin.scheduleForecast(saved.id, version, input.publishAt);
  }

  await loadDesk();
  return mapForecast(saved);
}

export function forecastById(id: string) {
  return cache.forecasts.find((item) => item.id === id) ?? null;
}

export async function fetchForecastById(id: string) {
  const local = forecastById(id);
  if (local) return local;
  const user = readSession();
  try {
    const row = user?.role === 'admin' ? await admin.forecast(id) : await forecastApi.get(id);
    return mapForecast(row);
  } catch {
    return null;
  }
}
