import type { LoginResult } from '@/lib/api/types';
import {
  clearSignupTokenCookie,
  setAuthTokenCookies,
  setSignupTokenCookie,
} from '@/lib/auth/cookies';
import type { GoogleAuthClientResponse } from '@/lib/auth/types';
import { extractTokens } from '@/lib/auth/upstream';

export type { GoogleAuthClientResponse } from '@/lib/auth/types';

function profileBits(data: LoginResult) {
  const profile = data.profile || {};
  return {
    email: typeof profile.email === 'string' ? profile.email : '',
    firstName: typeof profile.firstName === 'string' ? profile.firstName : '',
    lastName: typeof profile.lastName === 'string' ? profile.lastName : '',
  };
}

export async function toClientAuthResponse(data: LoginResult): Promise<GoogleAuthClientResponse> {
  if (data.mfaToken) {
    const profile = profileBits(data);
    return {
      status: 'mfa_required',
      message: data.mfaEnrollmentRequired
        ? 'Set up an authenticator app to finish signing in.'
        : 'Enter the code from your authenticator app.',
      code: data.mfaEnrollmentRequired ? 'MFA_ENROLL' : 'MFA_VERIFY',
      mfaToken: data.mfaToken,
      mfaEnrollmentRequired: Boolean(data.mfaEnrollmentRequired),
      ...profile,
    };
  }

  if (data.signupToken || data.signupRequired) {
    if (!data.signupToken) {
      return {
        status: 'error',
        message: 'Google sign-up could not be finished. Try again.',
        code: 'MISSING_SIGNUP_TOKEN',
      };
    }
    await setSignupTokenCookie(data.signupToken);
    const profile = profileBits(data);
    return {
      status: 'signup_required',
      message: 'Finish creating your account.',
      code: 'SOCIAL_SIGNUP',
      ...profile,
    };
  }

  const tokens = extractTokens(data);
  if (!tokens) {
    return {
      status: 'error',
      message: 'Unexpected authentication response from the server.',
      code: 'UNEXPECTED_RESPONSE',
    };
  }

  await setAuthTokenCookies({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessMaxAge: tokens.accessTokenExpiresIn,
    refreshMaxAge: tokens.refreshTokenExpiresIn,
  });
  await clearSignupTokenCookie();

  const profile = profileBits(data);
  return {
    status: 'authenticated',
    ...profile,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: tokens.tokenType,
      accessTokenExpiresIn: tokens.accessTokenExpiresIn,
      refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
    },
  };
}
