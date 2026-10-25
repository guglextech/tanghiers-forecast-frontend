import type { Delivery, Forecast, GameId } from '@/data/forecasts';
import type { Invoice, Role, SessionUser, SubscriptionStatus } from '@/lib/session';
import type { PlanId } from '@/data/site';
import type {
  ApiEntitlement,
  ApiForecast,
  ApiForecastBody,
  ApiForecastContent,
  ApiForecastField,
  ApiNotification,
  ApiPayment,
  ApiSubscription,
  ApiUser,
} from '@/lib/api/types';
import type { ForecastField } from '@/data/forecasts';

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

function numbersFromValue(value: unknown): number[] {
  if (typeof value === 'number' && Number.isFinite(value)) return [value];
  if (typeof value === 'string') {
    return value
      .split(/[-,\s]+/)
      .map((part) => Number(part))
      .filter((part) => Number.isFinite(part));
  }
  if (!Array.isArray(value)) return [];
  return value.map((part) => Number(part)).filter((part) => Number.isFinite(part));
}

function mapContentFields(fields: ApiForecastField[]): ForecastField[] {
  return fields.map((field) => {
    const key = field.key || field.label || 'field';
    const type = field.type === 'text' ? 'text' : 'numbers';
    const numbers = type === 'numbers' ? numbersFromValue(field.value) : [];
    const text =
      type === 'text'
        ? String(field.value ?? '')
        : numbers.join('-');
    return {
      key,
      label: field.label || key,
      type,
      numbers,
      text,
    };
  });
}

function bodyFromFields(fields: ForecastField[]): ApiForecastBody {
  const value = (key: string) => fields.find((field) => field.key === key);
  return {
    banker: value('banker')?.numbers ?? [],
    twoSure: value('twoSure')?.numbers ?? [],
    threeDirect: value('threeDirect')?.numbers ?? [],
    permutations: value('permutations')?.text || undefined,
  };
}

function fieldsFromBody(body?: ApiForecastBody | null): ForecastField[] {
  if (!body) return [];
  const fields: ForecastField[] = [];
  if (body.banker?.length) {
    fields.push({ key: 'banker', label: 'Banker', type: 'numbers', numbers: body.banker, text: body.banker.join('-') });
  }
  if (body.twoSure?.length) {
    fields.push({ key: 'twoSure', label: 'Two Sure', type: 'numbers', numbers: body.twoSure, text: body.twoSure.join('-') });
  }
  if (body.threeDirect?.length) {
    fields.push({
      key: 'threeDirect',
      label: 'Three Direct',
      type: 'numbers',
      numbers: body.threeDirect,
      text: body.threeDirect.join('-'),
    });
  }
  if (body.permutations) {
    fields.push({
      key: 'permutations',
      label: 'Permutations',
      type: 'text',
      numbers: [],
      text: body.permutations,
    });
  }
  return fields;
}

function videoIdFrom(row: ApiForecast, content?: ApiForecastContent | null) {
  return (
    content?.video?.videoId ||
    youtubeIdFromUrl(content?.video?.watchUrl) ||
    youtubeIdFromUrl(content?.video?.embedUrl) ||
    youtubeIdFromUrl(row.videoUrl)
  );
}

function readForecastContent(row: ApiForecast) {
  if (row.locked === true || row.content === null) {
    return {
      locked: true,
      body: null as ApiForecastBody | null,
      fields: [] as ForecastField[],
      videoId: null as string | null,
      videoUrl: null as string | null,
      message: row.message ?? null,
      hasVideo: Boolean(row.hasVideo),
    };
  }

  const content = row.content ?? null;
  if (content?.fields?.length) {
    const fields = mapContentFields(content.fields);
    const body = bodyFromFields(fields);
    const videoId = videoIdFrom(row, content);
    return {
      locked: false,
      body,
      fields,
      videoId,
      videoUrl: content.video?.watchUrl ?? row.videoUrl ?? null,
      message: content.message ?? row.message ?? null,
      hasVideo: Boolean(row.hasVideo || videoId),
    };
  }

  const body = row.body ?? null;
  const videoId = videoIdFrom(row, content);
  return {
    locked: false,
    body,
    fields: fieldsFromBody(body),
    videoId,
    videoUrl: content?.video?.watchUrl ?? row.videoUrl ?? null,
    message: content?.message ?? row.message ?? null,
    hasVideo: Boolean(row.hasVideo || videoId),
  };
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
  if (status === 'archived') return 'archived';
  return 'draft';
}

export function mapForecast(row: ApiForecast): Forecast {
  const content = readForecastContent(row);
  const numbers = flattenBody(content.body);
  const published = Boolean(row.publishedAt || row.status === 'published');
  return {
    id: row.id,
    title: row.title || 'Forecast',
    game: gameFromNumbers(numbers),
    numbers,
    body: mappedBody(content.body),
    fields: content.fields,
    date: (row.drawDate || row.date || '').slice(0, 10),
    status: mapForecastStatus(row.status) === 'draft' && published ? 'published' : mapForecastStatus(row.status),
    publishAt: row.publishAt ?? row.publishedAt ?? null,
    createdAt: row.createdAt ?? row.publishedAt ?? row.publishAt ?? new Date().toISOString(),
    version: row.version,
    videoUrl: content.videoUrl,
    videoId: content.videoId,
    hasVideo: content.hasVideo,
    message: content.message,
    locked: content.locked,
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
  if (status === 'delivered') return 'delivered';
  if (status === 'sent') return 'sent';
  if (status === 'queued' || status === 'pending') return 'queued';
  if (status === 'skipped' || status === 'failed') return 'skipped';
  return 'available';
}

export function mapDelivery(row: ApiNotification, index = 0): Delivery {
  const destination = row.destination || row.userEmail || row.email || '';
  return {
    id: row.id || `delivery-${index}-${row.forecastId || 'x'}`,
    forecastId: row.forecastId || '',
    userId: row.userId || '',
    userEmail: row.userEmail || row.email || destination,
    destination,
    channel: mapChannel(row.channel),
    status: mapDeliveryStatus(row.status),
    detail: row.errorMessage || row.detail || row.message || '',
    at: row.deliveredAt || row.sentAt || row.at || row.updatedAt || row.createdAt || new Date().toISOString(),
  };
}

const ZERO_DECIMAL = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);

function fromMinor(value: number, currency: string) {
  return ZERO_DECIMAL.has(currency) ? value : value / 100;
}

function paymentMoney(row: ApiPayment) {
  const currency = String(row.currency || 'USD').toUpperCase();
  const paid = typeof row.amountPaid === 'number' ? fromMinor(row.amountPaid, currency) : null;
  const due = typeof row.amountDue === 'number' ? fromMinor(row.amountDue, currency) : null;
  if (paid != null && paid > 0) return { amount: paid, currency };
  if (due != null) return { amount: due, currency };
  if (paid != null) return { amount: paid, currency };
  if (typeof row.amountCents === 'number' && Number.isFinite(row.amountCents)) {
    return { amount: fromMinor(row.amountCents, currency), currency };
  }
  const raw = Number(row.amount);
  if (!Number.isFinite(raw)) return { amount: 0, currency };
  if (Number.isInteger(raw) && raw >= 100) return { amount: fromMinor(raw, currency), currency };
  return { amount: raw, currency };
}

function isDayPassPayment(row: ApiPayment) {
  if (row.passDurationHours === 24) return true;
  const hint = [row.planCode, row.planId, row.planName, row.kind, row.label, row.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hint.includes('day') || hint.includes('pass');
}

export type AccountSubscription = {
  id: string;
  planCode: string;
  name: string;
  status: string;
  renewsAt: string | null;
  active: boolean;
};

export type AccountPayment = {
  id: string;
  planCode: string;
  label: string;
  status: string;
  amount: number;
  currency: string;
  at: string | null;
  invoiceUrl: string | null;
  dayPass: boolean;
};

export function mapAccountSubscription(row: ApiSubscription, index = 0): AccountSubscription {
  const status = String(row.status || '').toLowerCase();
  const planCode = String(row.planCode || row.planId || '').toLowerCase();
  const name =
    row.planName ||
    (planCode ? planCode.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Subscription');
  return {
    id: row.id || `sub-${index}`,
    planCode,
    name,
    status: status || 'unknown',
    renewsAt: row.currentPeriodEnd || null,
    active: status === 'active' || status === 'trialing',
  };
}

export function mapAccountPayment(row: ApiPayment, index = 0): AccountPayment {
  const planCode = String(row.planCode || row.planId || '').toLowerCase();
  const dayPass = isDayPassPayment(row) || (!planCode && !row.planName && !row.label && !row.description);
  const money = paymentMoney(row);
  const invoice = row.invoiceNumber?.trim();
  return {
    id: row.id || `pay-${index}`,
    planCode,
    label: row.planName || row.label || row.description || (invoice ? `Invoice ${invoice}` : 'One-day pass'),
    status: String(row.status || 'paid').toLowerCase(),
    amount: money.amount,
    currency: money.currency,
    at: row.paidAt || row.createdAt || row.date || null,
    invoiceUrl: row.invoiceUrl?.trim() || null,
    dayPass,
  };
}

export function mapPayment(row: ApiPayment, index = 0): Invoice {
  const payment = mapAccountPayment(row, index);
  return {
    id: payment.id,
    date: (payment.at || '').slice(0, 10),
    label: payment.label,
    amount: payment.amount,
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
    disabled: isUserDisabled(input.profile),
  };
}

export function isUserDisabled(row: Pick<ApiUser, 'disabled' | 'enabled' | 'status'>) {
  if (row.disabled === true || row.enabled === false) return true;
  const status = String(row.status || '').toLowerCase();
  return status === 'disabled' || status === 'blocked';
}

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  countryCode: string;
  timezone: string;
  role: Role;
  roleLabel: string;
  mfaEnabled: boolean;
  status: string;
  disabled: boolean;
  planId: PlanId | null;
  createdAt: string | null;
  lastLoginAt: string | null;
};

function titleCase(value: string) {
  const text = value.replace(/[_-]+/g, ' ').trim().toLowerCase();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function mapAdminUser(row: ApiUser): AdminAccount {
  const status = String(row.status || '').toLowerCase();
  return {
    id: row.id,
    name: displayName(row),
    email: row.email,
    emailVerified: Boolean(row.emailVerified),
    phone: row.phone || '',
    phoneVerified: Boolean(row.phoneVerified),
    countryCode: row.countryCode || '',
    timezone: row.timezone || '',
    role: mapRole(row.role),
    roleLabel: titleCase(row.role || 'user'),
    mfaEnabled: Boolean(row.mfaEnabled),
    status: status || 'unknown',
    disabled: isUserDisabled(row),
    planId: mapPlanId(row.planCode || row.planId),
    createdAt: row.createdAt || null,
    lastLoginAt: row.lastLoginAt || null,
  };
}

export type OverviewStats = {
  activeSubscribers: number;
  publishedForecasts: number;
  emailsSent: number;
  smsQueued: number;
  revenue: number;
  revenueCurrency: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickNumber(source: unknown, paths: string[]): number | null {
  const root = asRecord(source);
  if (!root) return null;
  for (const path of paths) {
    const value = path.split('.').reduce<unknown>((acc, key) => {
      const record = asRecord(acc);
      return record ? record[key] : undefined;
    }, root);
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
}

function pickRevenue(source: unknown): { amount: number; currency: string } | null {
  const root = asRecord(source);
  if (!root) return null;
  const revenue = asRecord(root.revenue) ?? root;
  const usd = revenue.USD ?? revenue.usd;
  if (typeof usd === 'number' && Number.isFinite(usd)) return { amount: usd, currency: 'USD' };
  const amount = pickNumber(revenue, ['amount', 'total', 'sum']);
  if (amount == null) return null;
  const currency = typeof revenue.currency === 'string' && revenue.currency ? revenue.currency : 'USD';
  return { amount, currency };
}

export function mapOverviewReport(
  report: Record<string, unknown> | null | undefined,
  fallback: OverviewStats,
): OverviewStats {
  if (!report) return fallback;
  const revenue = pickRevenue(report);
  return {
    activeSubscribers:
      pickNumber(report, [
        'subscriptions.active',
        'subscribers.active',
        'users.active',
        'activeSubscribers',
        'activeSubscriptions',
      ]) ?? fallback.activeSubscribers,
    publishedForecasts:
      pickNumber(report, ['forecasts.published', 'publishedForecasts', 'forecasts.total']) ??
      fallback.publishedForecasts,
    emailsSent:
      pickNumber(report, ['delivery.emailSent', 'delivery.emails', 'emailsSent', 'email.sent']) ??
      fallback.emailsSent,
    smsQueued:
      pickNumber(report, ['delivery.smsQueued', 'delivery.sms', 'smsQueued', 'sms.queued']) ??
      fallback.smsQueued,
    revenue: revenue?.amount ?? fallback.revenue,
    revenueCurrency: revenue?.currency ?? fallback.revenueCurrency,
  };
}
