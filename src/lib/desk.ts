import {
  SEED_FORECASTS,
  gameById,
  seedDeliveries,
  type Delivery,
  type DeliveryChannel,
  type Forecast,
  type GameId,
} from '@/data/forecasts';
import { listAccounts } from '@/lib/session';

const FORECASTS_KEY = 'tg.forecasts.v1';
const DELIVERIES_KEY = 'tg.deliveries.v1';

export type DeskState = {
  forecasts: Forecast[];
  deliveries: Delivery[];
};

export type ForecastDraft = {
  id?: string;
  title: string;
  game: GameId;
  numbers: number[];
  date: string;
  publishAt?: string | null;
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeDesk(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readForecasts(): Forecast[] {
  if (!canUseStorage()) return SEED_FORECASTS;
  try {
    const raw = window.localStorage.getItem(FORECASTS_KEY);
    if (!raw) {
      window.localStorage.setItem(FORECASTS_KEY, JSON.stringify(SEED_FORECASTS));
      return SEED_FORECASTS.map((forecast) => ({ ...forecast, numbers: [...forecast.numbers] }));
    }
    const parsed = JSON.parse(raw) as Forecast[];
    return Array.isArray(parsed) ? parsed : SEED_FORECASTS;
  } catch {
    return SEED_FORECASTS;
  }
}

function readDeliveries(): Delivery[] {
  if (!canUseStorage()) return seedDeliveries();
  try {
    const raw = window.localStorage.getItem(DELIVERIES_KEY);
    if (!raw) {
      const seeded = seedDeliveries();
      window.localStorage.setItem(DELIVERIES_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Delivery[];
    return Array.isArray(parsed) ? parsed : seedDeliveries();
  } catch {
    return seedDeliveries();
  }
}

function writeForecasts(forecasts: Forecast[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FORECASTS_KEY, JSON.stringify(forecasts));
}

function writeDeliveries(deliveries: Delivery[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DELIVERIES_KEY, JSON.stringify(deliveries));
}

function promoteDue(forecasts: Forecast[]) {
  const now = Date.now();
  let changed = false;
  const next = forecasts.map((forecast) => {
    if (forecast.status !== 'scheduled' || !forecast.publishAt) return forecast;
    if (new Date(forecast.publishAt).getTime() > now) return forecast;
    changed = true;
    return { ...forecast, status: 'published' as const };
  });
  return { forecasts: next, changed };
}

function channelDetail(channel: DeliveryChannel, skipped: boolean) {
  if (channel === 'web') return { status: 'available' as const, detail: 'Visible on the site' };
  if (channel === 'email') return { status: 'sent' as const, detail: 'Sent to the subscriber inbox' };
  if (skipped) {
    return { status: 'skipped' as const, detail: 'No mobile number or text consent on the account.' };
  }
  return { status: 'queued' as const, detail: 'Recorded. Text delivery is not active yet.' };
}

export function recordDeliveries(forecast: Forecast) {
  const deliveries = readDeliveries();
  if (deliveries.some((row) => row.forecastId === forecast.id)) return deliveries;
  const at = forecast.publishAt ?? new Date().toISOString();
  const rows: Delivery[] = [];
  for (const account of listAccounts()) {
    if (account.subscriptionStatus !== 'active') continue;
    for (const channel of ['web', 'email', 'sms'] as const) {
      const skipped = channel === 'sms' && !(account.phone && account.smsConsent);
      const meta = channelDetail(channel, skipped);
      rows.push({
        id: `${forecast.id}-${account.id}-${channel}`,
        forecastId: forecast.id,
        userId: account.id,
        userEmail: account.email,
        channel,
        status: meta.status,
        detail: meta.detail,
        at,
      });
    }
  }
  const next = [...rows, ...deliveries];
  writeDeliveries(next);
  return next;
}

export function readDesk(): DeskState {
  const loaded = readForecasts();
  const promoted = promoteDue(loaded);
  let forecasts = promoted.forecasts;
  if (promoted.changed) {
    writeForecasts(forecasts);
    for (const forecast of forecasts) {
      if (forecast.status === 'published') recordDeliveries(forecast);
    }
  }
  return {
    forecasts: forecasts.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    deliveries: readDeliveries().sort((a, b) => b.at.localeCompare(a.at)),
  };
}

function validateDraft(input: ForecastDraft) {
  const title = input.title.trim();
  const game = gameById(input.game);
  if (!title) throw new Error('Add a title.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Choose the forecast date.');
  if (input.numbers.length !== game.count || input.numbers.some((value) => !Number.isInteger(value) || value < 0 || value > 99)) {
    throw new Error(`Enter ${game.count} numbers, each from 0 to 99.`);
  }
  return { title, game };
}

export function saveForecast(input: ForecastDraft, mode: 'draft' | 'publish' | 'schedule'): Forecast {
  const { title } = validateDraft(input);
  if (mode === 'schedule' && !input.publishAt) {
    throw new Error('Choose a date and time to schedule publication.');
  }
  const forecasts = readForecasts();
  const existing = input.id ? forecasts.find((forecast) => forecast.id === input.id) : undefined;
  const now = new Date().toISOString();
  const forecast: Forecast = {
    id: existing?.id ?? `f-${Date.now()}`,
    title,
    game: input.game,
    numbers: input.numbers,
    date: input.date,
    status: mode === 'publish' ? 'published' : mode === 'schedule' ? 'scheduled' : 'draft',
    publishAt: mode === 'publish' ? now : mode === 'schedule' ? input.publishAt ?? null : null,
    createdAt: existing?.createdAt ?? now,
  };
  const next = existing
    ? forecasts.map((item) => (item.id === forecast.id ? forecast : item))
    : [forecast, ...forecasts];
  writeForecasts(next);
  if (forecast.status === 'published') recordDeliveries(forecast);
  emit();
  return forecast;
}

export function forecastById(id: string) {
  return readDesk().forecasts.find((forecast) => forecast.id === id) ?? null;
}
