const PENDING_KEY = 'tg.social.pending.v1';

export type PendingSocial = {
  email: string;
  firstName: string;
  lastName: string;
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function readPendingSocial(): PendingSocial | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingSocial> & { signupToken?: string };
    // Legacy payloads may still include signupToken in storage; never use it client-side.
    if (!parsed || (!parsed.email && !parsed.firstName && !parsed.lastName && !parsed.signupToken)) {
      return null;
    }
    return {
      email: parsed.email || '',
      firstName: parsed.firstName || '',
      lastName: parsed.lastName || '',
    };
  } catch {
    return null;
  }
}

export function writePendingSocial(pending: PendingSocial) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(
    PENDING_KEY,
    JSON.stringify({
      email: pending.email || '',
      firstName: pending.firstName || '',
      lastName: pending.lastName || '',
    }),
  );
}

export function clearPendingSocial() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(PENDING_KEY);
}

export function readIdTokenProfile(idToken: string) {
  try {
    const payload = idToken.split('.')[1];
    if (!payload) return { email: '', firstName: '', lastName: '' };
    const json = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as Record<string, unknown>;
    return {
      email: typeof json.email === 'string' ? json.email : '',
      firstName: typeof json.given_name === 'string' ? json.given_name : '',
      lastName: typeof json.family_name === 'string' ? json.family_name : '',
    };
  } catch {
    return { email: '', firstName: '', lastName: '' };
  }
}

export async function hasPendingSocialSignup() {
  try {
    const response = await fetch('/api/auth/social/status', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!response.ok) return false;
    const payload = (await response.json().catch(() => null)) as { pending?: boolean } | null;
    return Boolean(payload?.pending);
  } catch {
    return false;
  }
}
