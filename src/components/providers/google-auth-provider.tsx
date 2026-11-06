'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '@/lib/api/config';

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  // Missing clientId keeps the tree mounted; Google buttons surface a friendly config error.
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}
