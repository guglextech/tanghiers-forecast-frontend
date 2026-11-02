const PENDING_KEY = 'tg.social.pending.v1';

export type PendingSocial = {
  signupToken: string;
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
    const parsed = JSON.parse(raw) as Partial<PendingSocial>;
    if (!parsed?.signupToken) return null;
    return {
      signupToken: parsed.signupToken,
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
  window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
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
