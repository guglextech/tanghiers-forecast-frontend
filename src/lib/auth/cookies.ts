import { cookies } from 'next/headers';

export const SIGNUP_COOKIE = 'tg.signup.token';
export const ACCESS_COOKIE = 'tg.access.token';
export const REFRESH_COOKIE = 'tg.refresh.token';

const SIGNUP_MAX_AGE = 60 * 15; // 15 minutes
const ACCESS_MAX_AGE = 60 * 60; // 1 hour fallback
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days fallback

function secureCookie() {
  return process.env.NODE_ENV === 'production';
}

function baseOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function setSignupTokenCookie(token: string) {
  const store = await cookies();
  store.set(SIGNUP_COOKIE, token, baseOptions(SIGNUP_MAX_AGE));
}

export async function readSignupTokenCookie() {
  const store = await cookies();
  return store.get(SIGNUP_COOKIE)?.value?.trim() || '';
}

export async function clearSignupTokenCookie() {
  const store = await cookies();
  store.set(SIGNUP_COOKIE, '', { ...baseOptions(0), maxAge: 0 });
}

export async function setAuthTokenCookies(input: {
  accessToken?: string;
  refreshToken?: string;
  accessMaxAge?: number;
  refreshMaxAge?: number;
}) {
  const store = await cookies();
  if (input.accessToken) {
    store.set(
      ACCESS_COOKIE,
      input.accessToken,
      baseOptions(input.accessMaxAge && input.accessMaxAge > 0 ? input.accessMaxAge : ACCESS_MAX_AGE),
    );
  }
  if (input.refreshToken) {
    store.set(
      REFRESH_COOKIE,
      input.refreshToken,
      baseOptions(input.refreshMaxAge && input.refreshMaxAge > 0 ? input.refreshMaxAge : REFRESH_MAX_AGE),
    );
  }
}

export async function clearAuthTokenCookies() {
  const store = await cookies();
  store.set(ACCESS_COOKIE, '', { ...baseOptions(0), maxAge: 0 });
  store.set(REFRESH_COOKIE, '', { ...baseOptions(0), maxAge: 0 });
}
