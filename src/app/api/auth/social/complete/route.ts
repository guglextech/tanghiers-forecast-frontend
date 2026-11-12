import { NextRequest, NextResponse } from 'next/server';
import { clearSignupTokenCookie, readSignupTokenCookie } from '@/lib/auth/cookies';
import { assertSameOrigin } from '@/lib/auth/csrf';
import { productSlug } from '@/lib/auth/env';
import { toClientAuthResponse } from '@/lib/auth/response';
import { postUpstream } from '@/lib/auth/upstream';
import { socialCompleteBodySchema } from '@/lib/auth/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { status: 'error', message: 'Invalid request origin.', code: 'CSRF' },
      { status: 403 },
    );
  }

  const signupToken = await readSignupTokenCookie();
  if (!signupToken) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Your Google sign-up session expired. Continue with Google again.',
        code: 'MISSING_SIGNUP_TOKEN',
      },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Invalid JSON body.', code: 'BAD_REQUEST' },
      { status: 400 },
    );
  }

  const parsed = socialCompleteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'error',
        message: parsed.error.issues[0]?.message || 'Check the registration form and try again.',
        code: 'VALIDATION',
      },
      { status: 400 },
    );
  }

  const { firstName, lastName, countryCode, phone, consents } = parsed.data;

  const optional = {
    firstName,
    lastName,
    countryCode,
    phone,
  };
  const upstream = await postUpstream('/v1/auth/social/complete', {
    signupToken,
    productSlug: productSlug(),
    consents,
    ...Object.fromEntries(Object.entries(optional).filter(([, value]) => Boolean(value))),
  });

  if (!upstream.ok) {
    if (upstream.status === 401 || upstream.code?.toLowerCase().includes('signup')) {
      await clearSignupTokenCookie();
    }
    return NextResponse.json(
      {
        status: 'error',
        message: upstream.message,
        code: upstream.code,
      },
      { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502 },
    );
  }

  const client = await toClientAuthResponse(upstream.data);
  if (client.status === 'authenticated' || client.status === 'mfa_required') {
    await clearSignupTokenCookie();
  }
  const httpStatus =
    client.status === 'error' ? 502 : client.status === 'authenticated' ? 200 : 202;
  return NextResponse.json(client, { status: httpStatus });
}
