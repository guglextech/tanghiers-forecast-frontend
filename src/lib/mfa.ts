import QRCode from 'qrcode';
import { auth } from '@/lib/api/resources';
import { ApiError } from '@/lib/api/errors';
import type { LoginResult, MfaEnrollStart } from '@/lib/api/types';
import type { AuthTokens } from '@/lib/api/types';

const PENDING_KEY = 'tg.mfa.pending.v1';

export type PendingMfa = {
  mfaToken: string;
  enrollmentRequired: boolean;
  email: string;
};

export type MfaChallenge = {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
  email: string;
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function readPendingMfa(): PendingMfa | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingMfa;
    if (!parsed?.mfaToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePendingMfa(pending: PendingMfa) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function clearPendingMfa() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(PENDING_KEY);
}

export function mfaPathFor(pending: PendingMfa | null, next = '') {
  const query = next ? `?next=${encodeURIComponent(next)}` : '';
  if (!pending?.mfaToken) return `/login${query}`;
  return pending.enrollmentRequired ? `/login/mfa/setup${query}` : `/login/mfa${query}`;
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function buildOtpauthUrl(secret: string, email: string) {
  const issuer = 'Tanghiers';
  const label = email ? `${issuer}:${email}` : issuer;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

export function formatSecret(secret: string) {
  return secret.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim().toUpperCase();
}

export async function toQrDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    width: 240,
    margin: 1,
    color: { dark: '#101828', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
}

export async function mapEnrollStart(raw: MfaEnrollStart, email: string): Promise<MfaChallenge> {
  const record = raw as unknown as Record<string, unknown>;
  const secret = firstString(record, ['secret', 'totpSecret', 'base32', 'manualEntryKey']).replace(/\s+/g, '');
  const otpauthUrl =
    firstString(record, ['otpauthUrl', 'otpauth_uri', 'otpauthUri', 'uri', 'otpAuthUrl']) ||
    (secret ? buildOtpauthUrl(secret, email) : '');
  const providedQr = firstString(record, ['qrCode', 'qrCodeDataUrl', 'qr']);
  if (!otpauthUrl && !providedQr) {
    throw new ApiError('The authenticator setup details could not be loaded. Sign in again.');
  }
  const qrCode = providedQr.startsWith('data:image') ? providedQr : await toQrDataUrl(otpauthUrl || providedQr);
  const secretFromUrl = (() => {
    const raw = otpauthUrl.match(/[?&]secret=([^&]+)/i)?.[1];
    if (!raw) return '';
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  return {
    secret: secret || secretFromUrl,
    otpauthUrl,
    qrCode,
    email,
  };
}

export function tokensFromLoginResult(result: LoginResult): AuthTokens | null {
  if (result.tokens?.accessToken) {
    return {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    };
  }
  if (result.accessToken) {
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken ?? '',
    };
  }
  return null;
}

export function recoveryCodesFrom(result: LoginResult) {
  const codes = result.recoveryCodes;
  if (!Array.isArray(codes)) return [];
  return codes.map(String).filter(Boolean);
}

export async function fetchMfaChallenge() {
  const pending = readPendingMfa();
  if (!pending) throw new ApiError('Sign in again to set up your authenticator.', 401, 'MFA_EXPIRED');
  const raw = await auth.mfaEnrollStart(pending.mfaToken);
  if (raw.mfaToken && raw.mfaToken !== pending.mfaToken) {
    writePendingMfa({ ...pending, mfaToken: raw.mfaToken });
  }
  return mapEnrollStart(raw, pending.email);
}

export async function confirmMfaRequest(code: string) {
  const pending = readPendingMfa();
  if (!pending) throw new ApiError('Sign in again to set up your authenticator.', 401, 'MFA_EXPIRED');
  return auth.mfaEnrollConfirm(pending.mfaToken, code.trim());
}

export async function verifyMfaRequest(code: string) {
  const pending = readPendingMfa();
  if (!pending) throw new ApiError('Sign in again to enter your verification code.', 401, 'MFA_EXPIRED');
  return auth.mfaVerify(pending.mfaToken, code.trim());
}
