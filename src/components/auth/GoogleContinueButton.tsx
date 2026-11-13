'use client';

import { useEffect, useRef } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import { cn } from '@/lib/utils';

type CredentialResponse = {
  credential?: string;
};

type GoogleId = {
  initialize: (config: Record<string, unknown>) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
  disableAutoSelect: () => void;
};

function googleId(): GoogleId | null {
  const id = window.google?.accounts?.id;
  return id ? (id as GoogleId) : null;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleId } };
  }
}

export function GoogleContinueButton({
  disabled,
  resetKey = 0,
  onSuccess,
  onError,
}: {
  disabled?: boolean;
  resetKey?: number;
  onSuccess: (idToken: string, nonce: string) => void;
  onError?: (message: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef('');
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!clientId) {
      onErrorRef.current?.('Google sign-in is not configured.');
      return;
    }
    if (!scriptLoadedSuccessfully) return;
    const gis = googleId();
    if (!gis) {
      onErrorRef.current?.('Google sign-in failed to load.');
      return;
    }

    const nonce = crypto.randomUUID();
    nonceRef.current = nonce;

    gis.initialize({
      client_id: clientId,
      nonce,
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
      itp_support: true,
      callback: ({ credential }: CredentialResponse) => {
        if (credential) onSuccessRef.current(credential, nonceRef.current);
        else onErrorRef.current?.('Google did not return an ID token.');
      },
    });

    const paint = () => {
      const width = Math.max(240, Math.floor(host.getBoundingClientRect().width || 320));
      host.replaceChildren();
      gis.renderButton(host, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width,
      });
    };

    const frame = window.requestAnimationFrame(paint);
    return () => window.cancelAnimationFrame(frame);
  }, [clientId, resetKey, scriptLoadedSuccessfully]);

  return (
    <div
      ref={hostRef}
      className={cn(
        'flex min-h-10 w-full items-center justify-center',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      {!scriptLoadedSuccessfully ? (
        <p className="text-sm text-[#667085]">Loading Google…</p>
      ) : null}
    </div>
  );
}
