import type { GoogleAuthClientResponse } from '@/lib/auth/types';

async function readJson(response: Response): Promise<GoogleAuthClientResponse> {
  const payload = (await response.json().catch(() => null)) as GoogleAuthClientResponse | null;
  if (payload && typeof payload === 'object') return payload;
  return {
    status: 'error',
    message: 'Unexpected response from authentication.',
    code: 'BAD_RESPONSE',
  };
}

export async function postGoogleAuth(idToken: string, nonce?: string) {
  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(nonce ? { idToken, nonce } : { idToken }),
  });
  const result = await readJson(response);
  return { response, result };
}

export async function postSocialComplete(input: {
  countryCode: string;
  dateOfBirth: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedAge: boolean;
  minAge?: number;
}) {
  const response = await fetch('/api/auth/social/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  });
  const result = await readJson(response);
  return { response, result };
}
