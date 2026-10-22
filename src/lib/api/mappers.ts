import type { Delivery, Forecast, GameId } from '@/data/forecasts';
import type { Invoice, Role, SessionUser, SubscriptionStatus } from '@/lib/session';
import type { PlanId } from '@/data/site';
import type {
  ApiEntitlement,
  ApiForecast,
  ApiForecastBody,
  ApiNotification,
  ApiPayment,
  ApiSubscription,
  ApiUser,
} from '@/lib/api/types';

export function displayName(user: Partial<ApiUser> | null | undefined) {
  const joined = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return joined || user?.name || user?.email || 'Member';
}

export function mapRole(value: string | undefined): Role {
  return String(value || '').toLowerCase().includes('admin') ? 'admin' : 'member';
}

export function mapSubscriptionStatus(value: string | undefined | null): SubscriptionStatus {
  const status = String(value || '').toLowerCase();
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'canceled' || status === 'cancelled') return 'canceled';
  return 'inactive';
}

export function mapPlanId(value: string | null | undefined): PlanId | null {
  const code = String(value || '').trim().toLowerCase();
  return code || null;
}

export function hasEntitlement(value: ApiEntitlement | boolean | null | undefined) {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  if (value.entitled || value.hasAccess || value.active) return true;
  const status = String(value.status || '').toLowerCase();
  return status === 'active' || status === 'entitled';
}

export function splitName(name: string) {
  const trimmed = name.trim();
  const space = trimmed.indexOf(' ');
  if (space === -1) return { firstName: trimmed || 'Member', lastName: 'Account' };
  return { firstName: trimmed.slice(0, space), lastName: trimmed.slice(space + 1).trim() || 'Account' };
}

export function youtubeIdFromUrl(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match?.[1] ?? null;
}

function flattenBody(body?: ApiForecastBody | null) {
  return [...(body?.banker ?? []), ...(body?.twoSure ?? []), ...(body?.threeDirect ?? [])];
}

function gameFromNumbers(numbers: number[]): GameId {
  if (numbers.length >= 5) return 'pick-5';
  if (numbers.length === 4) return 'pick-4';
  if (numbers.length === 3) return 'pick-3';
  return 'pick-2';
}

export function numbersToBody(game: GameId, numbers: number[]): ApiForecastBody {
  if (game === 'pick-2') return { twoSure: numbers };
  if (game === 'pick-3') return { threeDirect: numbers };
  if (game === 'pick-4') return { twoSure: numbers.slice(0, 2), threeDirect: numbers.slice(2) };
  return { banker: numbers.slice(0, 1), twoSure: numbers.slice(1, 3), threeDirect: numbers.slice(3) };
}

export function permutationsFrom(banker: number[], twoSure: number[]) {
  return [...banker, ...twoSure].join('-');
}

export function forecastBodyFrom(input: {
  banker: number[];
  twoSure: number[];
  threeDirect: number[];
  permutations?: string;
}): ApiForecastBody {
  const permutations = input.permutations?.trim() || permutationsFrom(input.banker, input.twoSure);
  return {
    banker: input.banker,
    twoSure: input.twoSure,
    threeDirect: input.threeDirect,
    permutations,
  };
}

function mappedBody(body?: ApiForecastBody | null) {
  return {
    banker: body?.banker ?? [],
    twoSure: body?.twoSure ?? [],
    threeDirect: body?.threeDirect ?? [],
    permutations: body?.permutations ?? permutationsFrom(body?.banker ?? [], body?.twoSure ?? []),
  };
}

function mapForecastStatus(value: string | undefined): Forecast['status'] {
  const status = String(value || '').toLowerCase();
  if (status === 'published') return 'published';
  if (status === 'scheduled') return 'scheduled';
  return 'draft';
}

export function mapForecast(row: ApiForecast): Forecast {
  const numbers = flattenBody(row.body);
  return {
    id: row.id,
    title: row.title || 'Forecast',
    game: gameFromNumbers(numbers),
    numbers,
    body: mappedBody(row.body),
    date: (row.drawDate || row.date || '').slice(0, 10),
    status: mapForecastStatus(row.status),
    publishAt: row.publishAt ?? row.publishedAt ?? null,
    createdAt: row.createdAt ?? row.publishAt ?? new Date().toISOString(),
    version: row.version,
    videoUrl: row.videoUrl ?? null,
    message: row.message ?? null,
  };
}

function mapChannel(value: string | undefined): Delivery['channel'] {
  const channel = String(value || '').toLowerCase();
  if (channel === 'sms' || channel === 'text') return 'sms';
  if (channel === 'email') return 'email';
  return 'web';
}

function mapDeliveryStatus(value: string | undefined): Delivery['status'] {
  const status = String(value || '').toLowerCase();
  if (status === 'sent' || status === 'delivered') return 'sent';
  if (status === 'queued' || status === 'pending') return 'queued';
  if (status === 'skipped' || status === 'failed') return 'skipped';
  return 'available';
}

export function mapDelivery(row: ApiNotification, index = 0): Delivery {
  return {
    id: row.id || `delivery-${index}-${row.forecastId || 'x'}`,
    forecastId: row.forecastId || '',
    userId: row.userId || '',
    userEmail: row.userEmail || row.email || '',
    channel: mapChannel(row.channel),
    status: mapDeliveryStatus(row.status),
    detail: row.detail || row.message || '',
    at: row.at || row.sentAt || row.createdAt || new Date().toISOString(),
  };
}

export function mapPayment(row: ApiPayment, index = 0): Invoice {
  const raw = Number(row.amount ?? 0);
  const amount = raw >= 100 ? raw / 100 : raw;
  return {
    id: row.id || `pay-${index}`,
    date: (row.date || row.createdAt || '').slice(0, 10),
    label: row.label || row.description || 'Subscription',
    amount,
    status: 'Paid',
  };
}

export function mapSessionUser(input: {
  profile: ApiUser;
  subscription?: ApiSubscription | null;
  payments?: ApiPayment[];
  entitled?: boolean;
  smsConsent?: boolean;
}): SessionUser {
  const status = input.entitled
    ? 'active'
    : mapSubscriptionStatus(input.subscription?.status);
  const names = splitName(displayName(input.profile));
  return {
    id: input.profile.id,
    name: displayName(input.profile),
    firstName: input.profile.firstName || names.firstName,
    lastName: input.profile.lastName || names.lastName,
    email: input.profile.email,
    emailVerified: Boolean(input.profile.emailVerified),
    role: mapRole(input.profile.role),
    phone: input.profile.phone || '',
    timezone: input.profile.timezone || '',
    countryCode: input.profile.countryCode || '',
    smsConsent: Boolean(input.smsConsent),
    planId: mapPlanId(input.subscription?.planCode || input.subscription?.planId),
    subscriptionStatus: input.entitled && status === 'inactive' ? 'active' : status,
    currentPeriodEnd: input.subscription?.currentPeriodEnd ?? null,
    invoices: (input.payments ?? []).map(mapPayment),
  };
}

export function mapAdminUser(row: ApiUser & { subscriptionStatus?: string; planCode?: string }): SessionUser {
  const names = splitName(displayName(row));
  return {
    id: row.id,
    name: displayName(row),
    firstName: row.firstName || names.firstName,
    lastName: row.lastName || names.lastName,
    email: row.email,
    emailVerified: Boolean(row.emailVerified),
    role: mapRole(row.role),
    phone: row.phone || '',
    timezone: row.timezone || '',
    countryCode: row.countryCode || '',
    smsConsent: false,
    planId: mapPlanId(row.planCode),
    subscriptionStatus: mapSubscriptionStatus(row.subscriptionStatus),
    currentPeriodEnd: null,
    invoices: [],
  };
}
