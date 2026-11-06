import { NextRequest } from 'next/server';

/** Origin check for cookie-authenticated mutating routes. */
export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return true; // same-origin navigations / some clients omit Origin
  try {
    const url = new URL(origin);
    return url.host === host;
  } catch {
    return false;
  }
}
