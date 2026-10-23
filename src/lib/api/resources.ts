import { apiRequest, unwrapList } from '@/lib/api/client';
import { PRODUCT_SLUG } from '@/lib/api/config';
import type {
  ApiConsentMap,
  ApiEntitlement,
  ApiForecast,
  ApiNotification,
  ApiPayment,
  ApiPlan,
  ApiSubscription,
  ApiUser,
  AuthTokens,
  LoginResult,
  MfaEnrollStart,
} from '@/lib/api/types';

export const catalog = {
  product: () =>
    apiRequest<{ slug: string; name: string; timezone?: string; minAge?: number; supportEmail?: string }>(
      `/v1/products/${PRODUCT_SLUG}`,
      { auth: false },
    ),
  plans: () => apiRequest<ApiPlan[] | { items?: ApiPlan[] }>(`/v1/products/${PRODUCT_SLUG}/plans`, { auth: false }),
  countries: () =>
    apiRequest<Array<{ code: string; name: string; smsAvailable?: boolean; defaultTimezone?: string }>>(
      '/v1/countries',
      { auth: false },
    ),
  consents: () => apiRequest<ApiConsentMap>('/v1/legal/consents', { auth: false }),
};

export const auth = {
  register: (body: Record<string, unknown>) =>
    apiRequest<{ message?: string }>('/v1/auth/register', { method: 'POST', body, auth: false }),
  login: (email: string, password: string) =>
    apiRequest<LoginResult>('/v1/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  logout: (refreshToken: string) =>
    apiRequest<unknown>('/v1/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }),
  logoutAll: () => apiRequest<unknown>('/v1/auth/logout-all', { method: 'POST' }),
  verifyEmail: (token: string) =>
    apiRequest<unknown>('/v1/auth/email/verify', { method: 'POST', body: { token }, auth: false }),
  resendVerification: (email: string) =>
    apiRequest<unknown>('/v1/auth/email/resend', {
      method: 'POST',
      body: { email, productSlug: PRODUCT_SLUG },
      auth: false,
    }),
  forgotPassword: (email: string) =>
    apiRequest<unknown>('/v1/auth/password/forgot', {
      method: 'POST',
      body: { email, productSlug: PRODUCT_SLUG },
      auth: false,
    }),
  resetPassword: (token: string, newPassword: string) =>
    apiRequest<unknown>('/v1/auth/password/reset', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<unknown>('/v1/auth/password/change', { method: 'POST', body: { currentPassword, newPassword } }),
  google: (idToken: string) =>
    apiRequest<LoginResult>('/v1/auth/social/google', { method: 'POST', body: { idToken }, auth: false }),
  completeSocial: (body: Record<string, unknown>) =>
    apiRequest<LoginResult>('/v1/auth/social/complete', { method: 'POST', body, auth: false }),
  mfaVerify: (mfaToken: string, code: string) =>
    apiRequest<LoginResult>('/v1/auth/mfa/verify', { method: 'POST', body: { mfaToken, code }, auth: false }),
  mfaEnrollStart: (mfaToken: string) =>
    apiRequest<MfaEnrollStart>('/v1/auth/mfa/enroll/start', {
      method: 'POST',
      body: { mfaToken },
      auth: false,
    }),
  mfaEnrollConfirm: (mfaToken: string, code: string) =>
    apiRequest<LoginResult>('/v1/auth/mfa/enroll/confirm', {
      method: 'POST',
      body: { mfaToken, code },
      auth: false,
    }),
};

export const me = {
  profile: () => apiRequest<ApiUser>('/v1/me'),
  update: (body: Record<string, unknown>) => apiRequest<ApiUser>('/v1/me', { method: 'PATCH', body }),
  remove: (password: string) => apiRequest<unknown>('/v1/me', { method: 'DELETE', body: { password } }),
  consents: () => apiRequest<unknown>('/v1/me/consents'),
  setConsent: (key: string, granted: boolean, textVersion: string) =>
    apiRequest<unknown>(`/v1/me/consents/${key}`, { method: 'PUT', body: { granted, textVersion } }),
  exportData: () => apiRequest<unknown>('/v1/me/export'),
  subscriptions: () => apiRequest<ApiSubscription[] | { items?: ApiSubscription[] }>('/v1/me/subscriptions'),
  payments: () => apiRequest<ApiPayment[] | { items?: ApiPayment[] }>('/v1/me/payments'),
  entitlements: () =>
    apiRequest<ApiEntitlement | boolean>(`/v1/me/entitlements?productSlug=${encodeURIComponent(PRODUCT_SLUG)}`),
  notifications: () =>
    apiRequest<ApiNotification[] | { items?: ApiNotification[] }>('/v1/me/notifications?limit=100'),
  notificationPreferences: (email: boolean) =>
    apiRequest<unknown>('/v1/me/notification-preferences', { method: 'PATCH', body: { email } }),
  sendPhoneCode: () => apiRequest<unknown>('/v1/me/phone/verification', { method: 'POST' }),
  checkPhoneCode: (code: string) =>
    apiRequest<unknown>('/v1/me/phone/verification/check', { method: 'POST', body: { code } }),
  signInMethods: () => apiRequest<unknown>('/v1/me/sign-in-methods'),
};

export const billing = {
  checkout: (planCode: string, currency = 'USD') =>
    apiRequest<{ url?: string; checkoutUrl?: string }>('/v1/billing/checkout', {
      method: 'POST',
      body: { productSlug: PRODUCT_SLUG, planCode, currency },
    }),
  portal: () =>
    apiRequest<{ url?: string; portalUrl?: string }>('/v1/billing/portal', {
      method: 'POST',
      body: { productSlug: PRODUCT_SLUG },
    }),
};

function forecastsQuery(extra?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams({ productSlug: PRODUCT_SLUG });
  if (extra?.limit != null) params.set('limit', String(extra.limit));
  if (extra?.offset != null) params.set('offset', String(extra.offset));
  return `/v1/forecasts?${params.toString()}`;
}

export const forecasts = {
  list: (query?: { limit?: number; offset?: number }) =>
    apiRequest<ApiForecast[] | { items?: ApiForecast[]; total?: number; limit?: number; offset?: number }>(
      forecastsQuery(query),
    ),
  listPublic: (query?: { limit?: number; offset?: number }) =>
    apiRequest<ApiForecast[] | { items?: ApiForecast[]; total?: number }>(forecastsQuery(query), { auth: false }),
  today: () => apiRequest<ApiForecast | null>(`/v1/forecasts/today?productSlug=${encodeURIComponent(PRODUCT_SLUG)}`),
  get: (id: string) => apiRequest<ApiForecast>(`/v1/forecasts/${encodeURIComponent(id)}`),
};

export const notifications = {
  unsubscribe: (token: string) =>
    apiRequest<unknown>(`/v1/notifications/unsubscribe?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      auth: false,
    }),
};

export const admin = {
  forecasts: () =>
    apiRequest<ApiForecast[] | { items?: ApiForecast[] }>(
      `/v1/admin/forecasts?productSlug=${encodeURIComponent(PRODUCT_SLUG)}&limit=100`,
    ),
  forecast: (id: string) => apiRequest<ApiForecast>(`/v1/admin/forecasts/${id}`),
  createForecast: (body: Record<string, unknown>) =>
    apiRequest<ApiForecast>('/v1/admin/forecasts', { method: 'POST', body }),
  updateForecast: (id: string, body: Record<string, unknown>) =>
    apiRequest<ApiForecast>(`/v1/admin/forecasts/${id}`, { method: 'PATCH', body }),
  deleteForecast: (id: string, version: number) =>
    apiRequest<unknown>(`/v1/admin/forecasts/${id}?version=${version}`, { method: 'DELETE' }),
  publishForecast: (id: string, version: number) =>
    apiRequest<ApiForecast>(`/v1/admin/forecasts/${id}/publish`, { method: 'POST', body: { version } }),
  scheduleForecast: (id: string, version: number, publishAt: string) =>
    apiRequest<ApiForecast>(`/v1/admin/forecasts/${id}/schedule`, { method: 'POST', body: { version, publishAt } }),
  unscheduleForecast: (id: string, version: number) =>
    apiRequest<ApiForecast>(`/v1/admin/forecasts/${id}/unschedule`, { method: 'POST', body: { version } }),
  archiveForecast: (id: string, version: number) =>
    apiRequest<ApiForecast>(`/v1/admin/forecasts/${id}/archive`, { method: 'POST', body: { version } }),
  delivery: (forecastId: string) => apiRequest<unknown>(`/v1/admin/forecasts/${forecastId}/delivery`),
  deliveryMessages: (forecastId: string) =>
    apiRequest<ApiNotification[] | { items?: ApiNotification[] }>(
      `/v1/admin/forecasts/${forecastId}/delivery/messages`,
    ),
  retryDelivery: (forecastId: string, channel: string) =>
    apiRequest<unknown>(`/v1/admin/forecasts/${forecastId}/delivery/retry`, {
      method: 'POST',
      body: { channel },
    }),
  users: (limit = 100) =>
    apiRequest<ApiUser[] | { items?: ApiUser[] }>(`/v1/admin/users?limit=${limit}`),
  user: (id: string) => apiRequest<ApiUser>(`/v1/admin/users/${id}`),
  overview: () =>
    apiRequest<Record<string, unknown>>(`/v1/admin/reports/overview?productSlug=${encodeURIComponent(PRODUCT_SLUG)}`),
  readiness: () => apiRequest<unknown>('/v1/admin/readiness'),
  product: () => apiRequest<unknown>(`/v1/admin/products/${PRODUCT_SLUG}`),
  plans: () =>
    apiRequest<ApiPlan[] | { items?: ApiPlan[] }>(`/v1/admin/plans?productSlug=${encodeURIComponent(PRODUCT_SLUG)}`),
};

export function asList<T>(value: T[] | { items?: T[] } | null | undefined): T[] {
  return unwrapList<T>(value);
}

export type { AuthTokens };
