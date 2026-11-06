'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GoogleContinueButton } from '@/components/auth/GoogleContinueButton';
import { useSession } from '@/components/app/SessionProvider';
import { ApiError } from '@/lib/api/errors';
import { mfaPathFor, readPendingMfa } from '@/lib/mfa';

export function GoogleSignInButton({
  next = '',
  className,
  onSignedIn,
}: {
  next?: string;
  className?: string;
  onSignedIn?: (role: 'member' | 'admin') => void;
}) {
  const { continueWithGoogle } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const query = next ? `?next=${encodeURIComponent(next)}` : '';

  const finish = (role: 'member' | 'admin') => {
    if (onSignedIn) {
      onSignedIn(role);
      return;
    }
    if (next.startsWith('/') && !next.startsWith('//')) {
      router.replace(next);
      return;
    }
    router.replace(role === 'admin' ? '/admin' : '/feed');
  };

  const onSuccess = async (idToken: string, nonce: string) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const session = await continueWithGoogle(idToken, nonce);
      toast.success('Signed in with Google.');
      finish(session.role);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SOCIAL_SIGNUP') {
        router.replace(`/complete-registration${query}`);
        return;
      }
      if (err instanceof ApiError && (err.code === 'MFA_ENROLL' || err.code === 'MFA_VERIFY')) {
        router.replace(mfaPathFor(readPendingMfa(), next));
        return;
      }
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <GoogleContinueButton
        disabled={busy}
        onSuccess={(idToken, nonce) => void onSuccess(idToken, nonce)}
        onError={(message) => {
          setError(message);
          setBusy(false);
        }}
      />
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
