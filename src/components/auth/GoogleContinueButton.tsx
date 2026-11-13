'use client';

import { useEffect, useRef } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import { cn } from '@/lib/utils';

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

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
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

    let lastWidth = 0;
    let nonce = crypto.randomUUID();

    const paint = () => {
      const width = Math.max(240, Math.floor(frame.getBoundingClientRect().width || 0));
      if (width < 240 || Math.abs(width - lastWidth) < 8) return;
      lastWidth = width;

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
        width,
      });
    };

    nonce = crypto.randomUUID();
    lastWidth = 0;
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [clientId, disabled, resetKey, scriptLoadedSuccessfully]);

  return (
    <div
      ref={frameRef}
      className={cn(
        'relative h-10 w-full overflow-hidden rounded-[var(--radius)] border border-[#e6e8ee] bg-white',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      {/* Google's real control stays fully visible so the browser accepts the click. */}
      <div ref={hostRef} className="absolute inset-0 overflow-hidden [&_div]:!h-full [&_div]:!w-full" />

      {/* Face is visual only. Clicks pass through to Google underneath. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2.5 bg-white px-4 text-sm font-medium text-[#344054]"
      >
        <GoogleMark className="size-[18px] shrink-0" />
        <span>Continue with Google</span>
      </div>

      {!scriptLoadedSuccessfully ? (
        <p className="pointer-events-none absolute inset-0 grid place-items-center bg-white text-sm text-[#667085]">
          Loading Google…
        </p>
      ) : null}
    </div>
  );
}
