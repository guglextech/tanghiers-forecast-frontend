import { NextRequest, NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/csrf';
import { toClientAuthResponse } from '@/lib/auth/response';
import { postUpstream } from '@/lib/auth/upstream';
import { googleAuthBodySchema } from '@/lib/auth/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { status: 'error', message: 'Invalid request origin.', code: 'CSRF' },
      { status: 403 },
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

  const parsed = googleAuthBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'error',
        message: parsed.error.issues[0]?.message || 'Google ID token is required.',
        code: 'VALIDATION',
      },
      { status: 400 },
    );
  }

  const payload: Record<string, unknown> = { idToken: parsed.data.idToken };
  if (parsed.data.nonce) payload.nonce = parsed.data.nonce;

  const upstream = await postUpstream('/v1/auth/social/google', payload);
  if (!upstream.ok) {
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
  const httpStatus =
    client.status === 'error' ? 502 : client.status === 'authenticated' ? 200 : 202;
  return NextResponse.json(client, { status: httpStatus });
}
