import { NextResponse } from 'next/server';
import { readSignupTokenCookie } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

export async function GET() {
  const signupToken = await readSignupTokenCookie();
  return NextResponse.json(
    { pending: Boolean(signupToken) },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
