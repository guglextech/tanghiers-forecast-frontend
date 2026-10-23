import { API_BASE_URL, AUTH_STORAGE_KEY } from '@/lib/api/config';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { ApiEnvelope, AuthTokens } from '@/lib/api/types';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function readTokens(): AuthTokens | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthTokens;
    if (!parsed?.accessToken) return null;
    return parsed;
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

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const current = readTokens();
  if (!current?.refreshToken) return false;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      const payload = (await response.json().catch(() => null)) as ApiEnvelope<AuthTokens | { tokens?: AuthTokens }> | null;
      if (!response.ok || !payload?.success) {
        writeTokens(null);
        return false;
      }
      const data = payload.data as AuthTokens & { tokens?: AuthTokens };
      const next: AuthTokens | null = data?.accessToken
        ? { accessToken: data.accessToken, refreshToken: data.refreshToken ?? current.refreshToken }
        : data?.tokens?.accessToken
          ? data.tokens
          : null;
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
    if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
    else delete headers.Authorization;
    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  };

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

export function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const record = value as { items?: T[]; data?: T[]; results?: T[]; users?: T[] };
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.results)) return record.results;
    if (Array.isArray(record.users)) return record.users;
  }
  return [];
}
