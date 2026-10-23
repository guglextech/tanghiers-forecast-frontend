import { apiRequest, unwrapList } from '@/lib/api/client';
import { PRODUCT_SLUG, productBody, productResource, productUrl } from '@/lib/api/config';
import type {
  ApiConsentMap,
  ApiEntitlement,
  ApiForecast,
  ApiNotification,
  ApiOverviewReport,
  ApiPayment,
  ApiPlan,
  ApiSubscription,
  ApiUser,
  AuthTokens,
  LoginResult,
  MfaEnrollStart,
} from '@/lib/api/types';

export const catalog = {
  product: (productSlug = PRODUCT_SLUG) =>
    apiRequest<{ slug: string; name: string; timezone?: string; minAge?: number; supportEmail?: string }>(
      productResource('/v1/products', productSlug),
      { auth: false },
    ),
  plans: (productSlug = PRODUCT_SLUG) =>
    apiRequest<ApiPlan[] | { items?: ApiPlan[] }>(`${productResource('/v1/products', productSlug)}/plans`, {
      auth: false,
    }),
  countries: () =>
    apiRequest<Array<{ code: string; name: string; smsAvailable?: boolean; defaultTimezone?: string }>>(
      '/v1/countries',
      { auth: false },
    ),
  consents: () => apiRequest<ApiConsentMap>('/v1/legal/consents', { auth: false }),
};

export const auth = {
  register: (body: Record<string, unknown>) =>
    apiRequest<{ message?: string }>('/v1/auth/register', {
      method: 'POST',
      body: productBody(body),
      auth: false,
    }),
  login: (email: string, password: string) =>
    apiRequest<LoginResult>('/v1/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  logout: (refreshToken: string) =>
    apiRequest<unknown>('/v1/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }),
  logoutAll: () => apiRequest<unknown>('/v1/auth/logout-all', { method: 'POST' }),
  verifyEmail: (token: string) =>
    apiRequest<unknown>('/v1/auth/email/verify', { method: 'POST', body: { token }, auth: false }),
  resendVerification: (email: string, productSlug = PRODUCT_SLUG) =>
    apiRequest<unknown>('/v1/auth/email/resend', {
      method: 'POST',
      body: productBody({ email }, productSlug),
      auth: false,
    }),
  forgotPassword: (email: string, productSlug = PRODUCT_SLUG) =>
    apiRequest<unknown>('/v1/auth/password/forgot', {
      method: 'POST',
      body: productBody({ email }, productSlug),
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
    apiRequest<LoginResult>('/v1/auth/social/complete', {
      method: 'POST',
      body: productBody(body),
      auth: false,
    }),
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
  entitlements: (productSlug = PRODUCT_SLUG) =>
    apiRequest<ApiEntitlement | boolean>(productUrl('/v1/me/entitlements', {}, productSlug)),
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
  checkout: (planCode: string, currency = 'USD', productSlug = PRODUCT_SLUG) =>
    apiRequest<{ url?: string; checkoutUrl?: string }>('/v1/billing/checkout', {
      method: 'POST',
      body: productBody({ planCode, currency }, productSlug),
    }),
  portal: (productSlug = PRODUCT_SLUG) =>
    apiRequest<{ url?: string; portalUrl?: string }>('/v1/billing/portal', {
      method: 'POST',
      body: productBody({}, productSlug),
    }),
};

export type ForecastListQuery = {
  productSlug?: string;
  limit?: number;
  offset?: number;
};

export const forecasts = {
  list: (query: ForecastListQuery = {}) =>
    apiRequest<ApiForecast[] | { items?: ApiForecast[]; total?: number; limit?: number; offset?: number }>(
      productUrl('/v1/forecasts', { limit: query.limit, offset: query.offset }, query.productSlug),
    ),
  listPublic: (query: ForecastListQuery = {}) =>
    apiRequest<ApiForecast[] | { items?: ApiForecast[]; total?: number }>(
      productUrl('/v1/forecasts', { limit: query.limit, offset: query.offset }, query.productSlug),
      { auth: false },
    ),
  today: (productSlug = PRODUCT_SLUG) =>
    apiRequest<ApiForecast | null>(productUrl('/v1/forecasts/today', {}, productSlug)),
  get: (id: string) => apiRequest<ApiForecast>(`/v1/forecasts/${encodeURIComponent(id)}`),
};

export const notifications = {
  unsubscribe: (token: string) =>
    apiRequest<unknown>(`/v1/notifications/unsubscribe?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      auth: false,
    }),
};

export type AdminForecastQuery = {
  productSlug?: string;
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type AdminReportQuery = {
  productSlug?: string;
  from?: string;
  to?: string;
};

function adminForecastPath(id: string, suffix = '') {
  return `/v1/admin/forecasts/${encodeURIComponent(id)}${suffix}`;
}

function adminUserPath(id: string, suffix = '') {
  return `/v1/admin/users/${encodeURIComponent(id)}${suffix}`;
}

export const admin = {
  forecasts: (query: AdminForecastQuery = {}) =>
    apiRequest<ApiForecast[] | { items?: ApiForecast[]; total?: number }>(
      productUrl(
        '/v1/admin/forecasts',
        {
          limit: query.limit ?? 100,
          offset: query.offset ?? 0,
          status: query.status,
          from: query.from,
          to: query.to,
        },
        query.productSlug,
      ),
    ),
  forecast: (id: string) => apiRequest<ApiForecast>(adminForecastPath(id)),
  createForecast: (body: Record<string, unknown>, productSlug = PRODUCT_SLUG) =>
    apiRequest<ApiForecast>('/v1/admin/forecasts', { method: 'POST', body: productBody(body, productSlug) }),
  updateForecast: (id: string, body: Record<string, unknown>) =>
    apiRequest<ApiForecast>(adminForecastPath(id), { method: 'PATCH', body }),
  deleteForecast: (id: string, version: number) =>
    apiRequest<unknown>(`${adminForecastPath(id)}?version=${encodeURIComponent(String(version))}`, {
      method: 'DELETE',
    }),
  publishForecast: (id: string, version: number) =>
    apiRequest<ApiForecast>(adminForecastPath(id, '/publish'), { method: 'POST', body: { version } }),
  scheduleForecast: (id: string, version: number, publishAt: string) =>
    apiRequest<ApiForecast>(adminForecastPath(id, '/schedule'), {
      method: 'POST',
      body: { version, publishAt },
    }),
  unscheduleForecast: (id: string, version: number) =>
    apiRequest<ApiForecast>(adminForecastPath(id, '/unschedule'), { method: 'POST', body: { version } }),
  archiveForecast: (id: string, version: number) =>
    apiRequest<ApiForecast>(adminForecastPath(id, '/archive'), { method: 'POST', body: { version } }),
  delivery: (forecastId: string) => apiRequest<unknown>(adminForecastPath(forecastId, '/delivery')),
  deliveryMessages: (forecastId: string) =>
    apiRequest<ApiNotification[] | { items?: ApiNotification[] }>(
      adminForecastPath(forecastId, '/delivery/messages'),
    ),
  retryDelivery: (forecastId: string, channel: string) =>
    apiRequest<unknown>(adminForecastPath(forecastId, '/delivery/retry'), {
      method: 'POST',
      body: { channel },
    }),
  users: (query: { q?: string; limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams({
      limit: String(query.limit ?? 100),
      offset: String(query.offset ?? 0),
    });
    const search = query.q?.trim();
    if (search) params.set('search', search);
    return apiRequest<ApiUser[] | { items?: ApiUser[]; users?: ApiUser[]; total?: number }>(
      `/v1/admin/users?${params.toString()}`,
    );
  },
  user: (id: string) => apiRequest<ApiUser>(adminUserPath(id)),
  disableUser: (id: string) =>
    apiRequest<ApiUser>(adminUserPath(id, '/disable'), { method: 'POST' }),
  enableUser: (id: string) =>
    apiRequest<ApiUser>(adminUserPath(id, '/enable'), { method: 'POST' }),
  eraseUser: (id: string) =>
    apiRequest<unknown>(adminUserPath(id), { method: 'DELETE' }),
  makeAdmin: (id: string, code: string) =>
    apiRequest<ApiUser>(adminUserPath(id, '/make-admin'), { method: 'POST', body: { code } }),
  removeAdmin: (id: string, code: string) =>
    apiRequest<ApiUser>(adminUserPath(id, '/remove-admin'), { method: 'POST', body: { code } }),
  overview: (query: AdminReportQuery = {}) =>
    apiRequest<ApiOverviewReport>(
      productUrl('/v1/admin/reports/overview', { from: query.from, to: query.to }, query.productSlug),
    ),
  timeseries: (query: AdminReportQuery = {}) =>
    apiRequest<unknown>(
      productUrl('/v1/admin/reports/timeseries', { from: query.from, to: query.to }, query.productSlug),
    ),
  exportSubscriptions: (query: AdminReportQuery = {}) =>
    apiRequest<unknown>(
      productUrl(
        '/v1/admin/reports/export/subscriptions',
        { from: query.from, to: query.to },
        query.productSlug,
      ),
    ),
  readiness: () => apiRequest<unknown>('/v1/admin/readiness'),
  product: (productSlug = PRODUCT_SLUG) => apiRequest<unknown>(productResource('/v1/admin/products', productSlug)),
  plans: (productSlug = PRODUCT_SLUG) =>
    apiRequest<ApiPlan[] | { items?: ApiPlan[] }>(productUrl('/v1/admin/plans', {}, productSlug)),
};

export function asList<T>(value: T[] | { items?: T[] } | null | undefined): T[] {
  return unwrapList<T>(value);
}

export type { AuthTokens };
