'use client';

import { useRef, useState } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CredentialResponse = {
  credential?: string;
};

type PromptNotification = {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
};

type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    nonce?: string;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    itp_support?: boolean;
  }) => void;
  prompt: (callback?: (notification: PromptNotification) => void) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
  cancel: () => void;
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

function removeFallback() {
  document.querySelector('[data-google-fallback]')?.remove();
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
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
  onSuccess,
  onError,
  className,
}: {
  disabled?: boolean;
  onSuccess: (idToken: string, nonce: string) => void;
  onError?: (message: string) => void;
  className?: string;
}) {
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const [busy, setBusy] = useState(false);
  const nonceRef = useRef('');

  const fail = (message: string) => {
    removeFallback();
    setBusy(false);
    onError?.(message);
  };

  const start = () => {
    if (disabled || busy) return;
    onError?.('');
    if (!clientId) {
      fail('Google sign-in is not configured.');
      return;
    }
    const gis = googleId();
    if (!scriptLoadedSuccessfully || !gis) {
      fail('Google sign-in failed to load.');
      return;
    }

    const nonce = crypto.randomUUID();
    nonceRef.current = nonce;
    let settled = false;
    const finish = (credential?: string) => {
      if (settled) return;
      settled = true;
      removeFallback();
      try {
        gis.cancel();
      } catch {
        /* prompt may already be closed */
      }
      setBusy(false);
      if (credential) onSuccess(credential, nonce);
      else onError?.('Google did not return an ID token.');
    };

    setBusy(true);
    gis.initialize({
      client_id: clientId,
      nonce,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      itp_support: true,
      callback: (response) => finish(response.credential),
    });

    gis.prompt((notification) => {
      if (settled) return;
      if (notification.isDismissedMoment()) {
        if (notification.getDismissedReason() === 'credential_returned') return;
        settled = true;
        setBusy(false);
        return;
      }
      if (!notification.isNotDisplayed() && !notification.isSkippedMoment()) return;
      const reason = notification.isNotDisplayed()
        ? notification.getNotDisplayedReason()
        : notification.getSkippedReason();
      if (reason === 'missing_client_id' || reason === 'invalid_client') {
        settled = true;
        fail('Google sign-in is not configured.');
        return;
      }
      if (reason === 'unregistered_origin') {
        settled = true;
        fail('Google sign-in is not allowed on this site.');
        return;
      }
      showAccountPicker(gis, () => {
        if (settled) return;
        settled = true;
        setBusy(false);
      });
    });
  };

  return (
    <button
      type="button"
      onClick={start}
      disabled={disabled || busy}
      className={cn(
        'inline-flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-input bg-background text-sm font-medium hover:bg-muted disabled:opacity-60',
        className,
      )}
    >
      {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <GoogleMark />}
      {busy ? 'Continuing with Google' : 'Continue with Google'}
    </button>
  );
}

function showAccountPicker(gis: GoogleId, onCancel: () => void) {
  removeFallback();
  const root = document.createElement('div');
  root.setAttribute('data-google-fallback', '');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Continue with Google');
  root.style.cssText =
    'position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:16px;background:rgba(16,24,40,.36);';

  const card = document.createElement('div');
  card.style.cssText =
    'width:min(100%,22rem);border-radius:16px;background:#fff;padding:24px;box-shadow:0 16px 40px rgba(16,24,40,.16);';

  const title = document.createElement('p');
  title.textContent = 'Continue with Google';
  title.style.cssText = 'margin:0;font-size:1.05rem;font-weight:600;color:#101828;';

  const hint = document.createElement('p');
  hint.textContent = 'Choose the Google account to use.';
  hint.style.cssText = 'margin:6px 0 16px;font-size:14px;line-height:1.5;color:#667085;';

  const buttonHost = document.createElement('div');
  buttonHost.style.cssText = 'display:flex;justify-content:center;min-height:40px;';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.style.cssText =
    'display:block;width:100%;margin-top:14px;border:0;background:transparent;color:#667085;font:inherit;font-size:14px;font-weight:500;cursor:pointer;';
  cancel.addEventListener('click', () => {
    removeFallback();
    onCancel();
  });

  card.append(title, hint, buttonHost, cancel);
  root.append(card);
  root.addEventListener('click', (event) => {
    if (event.target !== root) return;
    removeFallback();
    onCancel();
  });
  document.body.append(root);
  gis.renderButton(buttonHost, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    width: 304,
  });
}
