import { gameById, publishedForecasts, type Forecast } from '@/data/forecasts';
import { formatWeekdayDay } from '@/lib/dates';
import type { SessionUser } from '@/lib/session';

export type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
  at: string;
  read: boolean;
};

const KEY = 'tg.notifications.v1';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeNotifications(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStore(): Record<string, Notice[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Notice[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, Notice[]>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
  emit();
}

function seedForUser(user: SessionUser, forecasts: Forecast[]): Notice[] {
  const published = publishedForecasts(forecasts);
  const notices: Notice[] = published.map((forecast, index) => ({
    id: `n-${user.id}-${forecast.id}`,
    title: index === 0 ? 'Today’s forecast is ready' : forecast.title,
    body: `${gameById(forecast.game).label} · ${formatWeekdayDay(forecast.date)}`,
    href: `/forecasts/${forecast.id}`,
    at: forecast.publishAt ?? `${forecast.date}T08:00:00.000Z`,
    read: index !== 0,
  }));

  if (user.subscriptionStatus !== 'active') {
    notices.unshift({
      id: `n-${user.id}-plan`,
      title: 'Unlock the numbers',
      body: 'An active plan opens the forecast and the draw.',
      href: '/subscription',
      at: new Date().toISOString(),
      read: false,
    });
  }

  notices.push({
    id: `n-${user.id}-welcome`,
    title: 'Welcome to Tanghiers',
    body: 'New forecasts land here and on the feed.',
    href: '/feed',
    at: '2026-09-01T08:00:00.000Z',
    read: true,
  });

  return notices;
}

export function listNotifications(user: SessionUser, forecasts: Forecast[]): Notice[] {
  const store = readStore();
  const existing = store[user.id] ?? [];
  const byId = new Map(existing.map((notice) => [notice.id, notice]));
  for (const notice of seedForUser(user, forecasts)) {
    if (!byId.has(notice.id)) byId.set(notice.id, notice);
  }
  const next = [...byId.values()].sort((a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id));
  if (JSON.stringify(existing) !== JSON.stringify(next)) {
    store[user.id] = next;
    writeStore(store);
  }
  return next;
}

export function markNoticeRead(userId: string, id: string) {
  const store = readStore();
  const items = store[userId];
  if (!items) return;
  store[userId] = items.map((notice) => (notice.id === id ? { ...notice, read: true } : notice));
  writeStore(store);
}

export function markAllNoticesRead(userId: string) {
  const store = readStore();
  const items = store[userId];
  if (!items) return;
  store[userId] = items.map((notice) => ({ ...notice, read: true }));
  writeStore(store);
}
