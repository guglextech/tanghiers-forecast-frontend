import { API_BASE_URL, AUTH_STORAGE_KEY } from '@/lib/api/config';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { ApiEnvelope, AuthTokens } from '@/lib/api/types';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

const ACCESS_SKEW_MS = 60_000;

function canUseStorage() {
  return typeof window !== 'undefined';
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function asText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export function normalizeTokens(data: unknown, previous?: AuthTokens | null): AuthTokens | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;
  const nested = row.tokens && typeof row.tokens === 'object' ? (row.tokens as Record<string, unknown>) : row;
  const accessToken = asText(nested.accessToken);
  if (!accessToken) return null;
  const refreshToken = asText(nested.refreshToken) || previous?.refreshToken || '';
  const now = Date.now();
  const accessIn = asNumber(nested.accessTokenExpiresIn);
  const refreshIn = asNumber(nested.refreshTokenExpiresIn);
  return {
    accessToken,
    refreshToken,
    tokenType: asText(nested.tokenType) || 'Bearer',
    accessTokenExpiresAt: accessIn ? now + accessIn * 1000 : previous?.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: refreshIn ? now + refreshIn * 1000 : previous?.refreshTokenExpiresAt ?? null,
  };
}

export function readTokens(): AuthTokens | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthTokens>;
    if (!parsed?.accessToken) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken || '',
      tokenType: parsed.tokenType || 'Bearer',
      accessTokenExpiresAt: parsed.accessTokenExpiresAt ?? null,
      refreshTokenExpiresAt: parsed.refreshTokenExpiresAt ?? null,
    };
  } catch {
    return null;
  }
}

export function writeTokens(tokens: AuthTokens | null) {
  if (!canUseStorage()) return;
  if (!tokens) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
}

function isAccessStale(tokens: AuthTokens) {
  if (!tokens.accessTokenExpiresAt) return false;
  return Date.now() >= tokens.accessTokenExpiresAt - ACCESS_SKEW_MS;
}

function isRefreshExpired(tokens: AuthTokens) {
  if (!tokens.refreshTokenExpiresAt) return false;
  return Date.now() >= tokens.refreshTokenExpiresAt;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const current = readTokens();
  if (!current?.refreshToken || isRefreshExpired(current)) {
    writeTokens(null);
    return false;
  }
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      const payload = (await response.json().catch(() => null)) as ApiEnvelope<unknown> | null;
      if (!response.ok || !payload?.success) {
        writeTokens(null);
        return false;
      }
      const next = normalizeTokens(payload.data, current);
      if (!next) {
        writeTokens(null);
        return false;
      }
      writeTokens(next);
      return true;
    } catch {
      writeTokens(null);
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function ensureAccessToken(): Promise<boolean> {
  const tokens = readTokens();
  if (!tokens?.accessToken && !tokens?.refreshToken) return false;
  if (isRefreshExpired(tokens)) {
    writeTokens(null);
    return false;
  }
  if (tokens.accessToken && !isAccessStale(tokens)) return true;
  return refreshTokens();
}

async function parseBody(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204) return null;
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return text ? { message: text } : null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const send = async () => {
    const tokens = options.auth === false ? null : readTokens();
    if (tokens?.accessToken) {
      headers.Authorization = `${tokens.tokenType || 'Bearer'} ${tokens.accessToken}`;
    } else {
      delete headers.Authorization;
    }
    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  };

  if (options.auth !== false) await ensureAccessToken();

  let response = await send();
  if (response.status === 401 && options.auth !== false) {
    const refreshed = await refreshTokens();
    if (refreshed) response = await send();
  }

  const payload = (await parseBody(response)) as ApiEnvelope<T> | null;
  if (!response.ok || (payload && payload.success === false)) {
    throw new ApiError(
      errorMessage(payload, response.status === 401 ? 'Please log in again.' : 'Request failed.'),
      response.status,
      payload && 'code' in payload ? (payload.code ?? payload.error ?? null) : null,
      payload && 'path' in payload ? payload.path : path,
    );
  }
  if (payload && 'data' in payload) return payload.data as T;
  return payload as T;
}

function filenameFromDisposition(header: string | null, fallback: string) {
  if (!header) return fallback;
  const utf = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf?.[1]) {
    try {
      return decodeURIComponent(utf[1].replace(/['"]/g, ''));
    } catch {
      return utf[1];
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain?.[1]?.trim() || fallback;
}

export async function apiDownload(
  path: string,
  fallbackName: string,
  options: Omit<RequestOptions, 'body'> = {},
): Promise<{ blob: Blob; filename: string }> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  const send = async () => {
    const tokens = options.auth === false ? null : readTokens();
    if (tokens?.accessToken) {
      headers.Authorization = `${tokens.tokenType || 'Bearer'} ${tokens.accessToken}`;
    } else {
      delete headers.Authorization;
    }
    return fetch(`${API_BASE_URL}${path}`, { method, headers });
  };

  if (options.auth !== false) await ensureAccessToken();

  let response = await send();
  if (response.status === 401 && options.auth !== false) {
    const refreshed = await refreshTokens();
    if (refreshed) response = await send();
  }

  if (!response.ok) {
    const payload = (await parseBody(response)) as ApiEnvelope<unknown> | null;
    throw new ApiError(
      errorMessage(payload, response.status === 401 ? 'Please log in again.' : 'Download failed.'),
      response.status,
      payload && 'code' in payload ? (payload.code ?? payload.error ?? null) : null,
      path,
    );
  }

  return {
    blob: await response.blob(),
    filename: filenameFromDisposition(response.headers.get('content-disposition'), fallbackName),
  };
}

export function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const record = value as {
      items?: T[];
      data?: T[];
      results?: T[];
      users?: T[];
      payments?: T[];
      subscriptions?: T[];
      plans?: T[];
      entries?: T[];
      waitlist?: T[];
    };
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.results)) return record.results;
    if (Array.isArray(record.users)) return record.users;
    if (Array.isArray(record.payments)) return record.payments;
    if (Array.isArray(record.subscriptions)) return record.subscriptions;
    if (Array.isArray(record.plans)) return record.plans;
    if (Array.isArray(record.entries)) return record.entries;
    if (Array.isArray(record.waitlist)) return record.waitlist;
  }
  return [];
}
