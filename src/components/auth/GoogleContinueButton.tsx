'use client';

import { useEffect, useRef } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';

type CredentialResponse = {
  credential?: string;
};

type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    nonce: string;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
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
  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    const host = hostRef.current;
    const frame = frameRef.current;
    if (!host || !frame || disabled) return;
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
    gis.initialize({
      client_id: clientId,
      nonce,
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: ({ credential }) => {
        if (credential) onSuccessRef.current(credential, nonce);
        else onErrorRef.current?.('Google did not return an ID token.');
      },
    });
    host.replaceChildren();
    gis.renderButton(host, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: Math.max(240, Math.floor(frame.clientWidth || 320)),
    });
  }, [clientId, disabled, resetKey, scriptLoadedSuccessfully]);

  return (
    <div ref={frameRef} className="min-h-10 w-full">
      <div ref={hostRef} className="flex min-h-10 w-full justify-center" />
      {!scriptLoadedSuccessfully ? <p className="text-center text-sm text-[#667085]">Loading Google…</p> : null}
    </div>
  );
}
