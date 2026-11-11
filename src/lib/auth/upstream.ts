import type { ApiEnvelope, LoginResult } from '@/lib/api/types';
import { apiBaseUrl } from '@/lib/auth/env';

export type UpstreamFailure = {
  ok: false;
  status: number;
  message: string;
  code: string | null;
};

export type UpstreamSuccess = {
  ok: true;
  status: number;
  data: LoginResult;
  raw: ApiEnvelope<LoginResult> | LoginResult;
};

export type UpstreamResult = UpstreamSuccess | UpstreamFailure;

function messageFrom(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback;
  const body = payload as { message?: unknown; error?: unknown };
  if (Array.isArray(body.message)) return body.message.filter(Boolean).join(' ') || fallback;
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  if (typeof body.error === 'string' && body.error.trim()) return body.error;
  return fallback;
}

function asLoginResult(payload: unknown): LoginResult {
  if (!payload || typeof payload !== 'object') return {};
  const envelope = payload as ApiEnvelope<LoginResult>;
  if (envelope && typeof envelope === 'object' && 'data' in envelope && envelope.data) {
    return envelope.data;
  }
  return payload as LoginResult;
}

export async function postUpstream(path: string, body: Record<string, unknown>): Promise<UpstreamResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<LoginResult> | null;
    if (!response.ok || (payload && payload.success === false)) {
      return {
        ok: false,
        status: response.status || 502,
        message: messageFrom(payload, 'Authentication request failed.'),
        code: payload?.code ?? payload?.error ?? null,
      };
    }
    return {
      ok: true,
      status: response.status,
      data: asLoginResult(payload),
      raw: payload ?? {},
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return {
      ok: false,
      status: 503,
      message: aborted ? 'The authentication service timed out.' : 'The authentication service is unavailable.',
      code: aborted ? 'TIMEOUT' : 'UPSTREAM_UNAVAILABLE',
    };
  } finally {
    clearTimeout(timer);
  }
}

export function extractTokens(data: LoginResult) {
  const nested = data.tokens ?? {};
  const accessToken =
    (typeof nested.accessToken === 'string' && nested.accessToken) ||
    (typeof data.accessToken === 'string' && data.accessToken) ||
    '';
  const refreshToken =
    (typeof nested.refreshToken === 'string' && nested.refreshToken) ||
    (typeof data.refreshToken === 'string' && data.refreshToken) ||
    '';
  const accessMaxAge =
    typeof nested.accessTokenExpiresIn === 'number'
      ? nested.accessTokenExpiresIn
      : typeof data.accessTokenExpiresIn === 'number'
        ? data.accessTokenExpiresIn
        : undefined;
  const refreshMaxAge =
    typeof nested.refreshTokenExpiresIn === 'number'
      ? nested.refreshTokenExpiresIn
      : typeof data.refreshTokenExpiresIn === 'number'
        ? data.refreshTokenExpiresIn
        : undefined;
  if (!accessToken) return null;
  return {
    accessToken,
    refreshToken,
    tokenType:
      (typeof nested.tokenType === 'string' && nested.tokenType) ||
      (typeof data.tokenType === 'string' && data.tokenType) ||
      'Bearer',
    accessTokenExpiresIn: accessMaxAge,
    refreshTokenExpiresIn: refreshMaxAge,
  };
}
