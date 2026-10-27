import { PRODUCT_SLUG } from '@/lib/api/config';
import { admin, asList, auth, billing, catalog, me } from '@/lib/api/resources';
import { readTokens, writeTokens } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import {
  hasEntitlement,
  mapAdminUser,
  mapSessionUser,
  splitName,
  type AdminAccount,
} from '@/lib/api/mappers';
import type { ApiPayment, ApiSubscription, ApiUser, LoginResult } from '@/lib/api/types';
import type { PlanId } from '@/data/site';
import {
  clearPendingMfa,
  confirmMfaRequest,
  recoveryCodesFrom,
  tokensFromLoginResult,
  verifyMfaRequest,
  writePendingMfa,
} from '@/lib/mfa';

export type Role = 'member' | 'admin';
export type SubscriptionStatus = 'inactive' | 'active' | 'canceled';

export type Invoice = {
  id: string;
  date: string;
  label: string;
  amount: number;
  status: 'Paid';
};

export type SessionUser = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  role: Role;
  phone: string;
  timezone: string;
  countryCode: string;
  smsConsent: boolean;
  planId: PlanId | null;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  invoices: Invoice[];
  disabled?: boolean;
};

const SESSION_KEY = 'tg.session.v1';
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function hasForecastAccess(user: SessionUser | null | undefined) {
  if (!user) return false;
  return user.role === 'admin' || user.subscriptionStatus === 'active';
}

export function handleFromName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18);
  return slug || 'member';
}

export function initialsFromName(name: string) {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TG'
  );
}

function normalizeSession(parsed: Partial<SessionUser> | null | undefined): SessionUser | null {
  if (!parsed?.email) return null;
  const names = splitName(parsed.name || parsed.email);
  return {
    id: parsed.id || '',
    name: parsed.name || `${names.firstName} ${names.lastName}`.trim(),
    firstName: parsed.firstName || names.firstName,
    lastName: parsed.lastName || names.lastName,
    email: parsed.email,
    emailVerified: Boolean(parsed.emailVerified),
    role: parsed.role === 'admin' ? 'admin' : 'member',
    phone: parsed.phone || '',
    timezone: parsed.timezone || '',
    countryCode: parsed.countryCode || '',
    smsConsent: Boolean(parsed.smsConsent),
    planId: parsed.planId ?? null,
    subscriptionStatus: parsed.subscriptionStatus ?? 'inactive',
    currentPeriodEnd: parsed.currentPeriodEnd ?? null,
    invoices: parsed.invoices ?? [],
    disabled: Boolean(parsed.disabled),
  };
}

export function readSession(): SessionUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return normalizeSession(JSON.parse(raw) as Partial<SessionUser>);
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser | null) {
  if (!canUseStorage()) return;
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  writeTokens(null);
  writeSession(null);
}

let accountCache: AdminAccount[] = [];

export function listAccounts(): AdminAccount[] {
  return accountCache;
}

export async function refreshAccounts(q?: string) {
  const rows = asList<ApiUser>(await admin.users({ q, limit: 100 }));
  accountCache = rows.map(mapAdminUser).sort((a, b) => a.name.localeCompare(b.name));
  return accountCache;
}

async function loadSmsConsent() {
  try {
    const consents = await me.consents();
    if (!consents || typeof consents !== 'object') return false;
    const record = consents as Record<string, { granted?: boolean } | boolean>;
    const sms = record.SMS ?? record.sms;
    if (typeof sms === 'boolean') return sms;
    return Boolean(sms && typeof sms === 'object' && sms.granted);
  } catch {
    return false;
  }
}

export async function hydrateSession(): Promise<SessionUser | null> {
  if (!readTokens()?.accessToken) {
    writeSession(null);
    return null;
  }
  try {
    const [profile, subscriptions, payments, entitlement] = await Promise.all([
      me.profile(),
      me.subscriptions().catch(() => []),
      me.payments().catch(() => []),
      me.entitlements().catch(() => false),
    ]);
    const list = asList<ApiSubscription>(subscriptions);
    const subscription =
      list.find((row) => !row.productSlug || row.productSlug === PRODUCT_SLUG) ?? null;
    const user = mapSessionUser({
      profile,
      subscription,
      payments: asList<ApiPayment>(payments),
      entitled: hasEntitlement(entitlement),
      smsConsent: await loadSmsConsent(),
    });
    writeSession(user);
    return user;
  } catch {
    clearSession();
    return null;
  }
}

function applyTokens(result: LoginResult) {
  const tokens = tokensFromLoginResult(result);
  if (!tokens?.accessToken) {
    throw new ApiError('Could not sign in.', 401);
  }
  writeTokens(tokens);
}

async function sessionFromLogin(result: LoginResult): Promise<SessionUser> {
  applyTokens(result);
  clearPendingMfa();
  const session = await hydrateSession();
  if (!session) throw new ApiError('Signed in, but the profile could not be loaded.');
  return session;
}

export async function loginAccount(input: { email: string; password: string }): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  const result = await auth.login(email, input.password);
  if (result.mfaToken) {
    writePendingMfa({
      mfaToken: result.mfaToken,
      enrollmentRequired: Boolean(result.mfaEnrollmentRequired),
      email,
    });
    throw new ApiError(
      result.mfaEnrollmentRequired
        ? 'Set up an authenticator app to finish signing in.'
        : 'Enter the code from your authenticator app.',
      401,
      result.mfaEnrollmentRequired ? 'MFA_ENROLL' : 'MFA_VERIFY',
    );
  }
  return sessionFromLogin(result);
}

export async function completeMfaVerify(code: string): Promise<SessionUser> {
  return sessionFromLogin(await verifyMfaRequest(code));
}

export async function completeMfaEnroll(code: string): Promise<{ user: SessionUser; recoveryCodes: string[] }> {
  const result = await confirmMfaRequest(code);
  const recoveryCodes = recoveryCodesFrom(result);
  const user = await sessionFromLogin(result);
  return { user, recoveryCodes };
}

export type SignupInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  consents: { terms: string; privacy: string; age: string };
};

export async function signupAccount(input: SignupInput): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName) throw new Error('Enter a first name.');
  if (!lastName) throw new Error('Enter a last name.');

  await auth.register({
    email,
    password: input.password,
    firstName,
    lastName,
    countryCode: 'US',
    consents: {
      terms: input.consents.terms,
      privacy: input.consents.privacy,
      age: input.consents.age,
    },
  });
  throw new ApiError(
    'If that email can be used, a message with next steps has been sent to it.',
    202,
    'PENDING_VERIFICATION',
  );
}

export async function continueWithGoogle(): Promise<SessionUser> {
  throw new ApiError('Google sign-in needs a Google ID token from the API.');
}

export async function logoutAccount() {
  const refreshToken = readTokens()?.refreshToken;
  try {
    if (refreshToken) await auth.logout(refreshToken);
  } catch {
    /* still clear local session */
  }
  clearSession();
}

export async function updateProfile(input: {
  firstName: string;
  lastName: string;
  timezone: string;
  phone: string;
  smsConsent: boolean;
}) {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName) throw new Error('Enter a first name.');
  if (!lastName) throw new Error('Enter a last name.');

  const nextPhone = input.phone.trim().replace(/\s+/g, '');
  if (nextPhone && !PHONE_PATTERN.test(nextPhone)) {
    throw new Error('Enter a mobile number with a country code, for example +233550982043.');
  }

  const timezone = input.timezone.trim();
  if (!timezone) throw new Error('Choose a timezone.');
  if (input.smsConsent && !nextPhone) {
    throw new Error('Add a mobile number before turning on text messages.');
  }

  await me.update({ firstName, lastName, timezone });
  const storedPhone = readSession()?.phone || '';
  if (storedPhone !== nextPhone) {
    await me.update({ phone: nextPhone || null });
  }

  try {
    const consents = await catalog.consents();
    const version = consents.SMS?.version ?? consents.sms?.version ?? 'sms-2026-10';
    await me.setConsent('SMS', input.smsConsent, version);
  } catch {
    /* profile saved even if consent endpoint fails */
  }

  const session = await hydrateSession();
  if (!session) throw new Error('Could not refresh your account.');
  return session;
}

export async function exportAccountData() {
  return me.exportData();
}

export async function deleteAccount(password: string) {
  if (!password.trim()) throw new Error('Enter your password to delete this account.');
  await me.remove(password);
  clearSession();
}

export async function savePhone(userId: string, phone: string, smsConsent: boolean) {
  void userId;
  const nextPhone = phone.trim().replace(/\s+/g, '');
  if (!PHONE_PATTERN.test(nextPhone)) {
    throw new Error('Enter a mobile number with a country code, for example +233550982043.');
  }
  await me.update({ phone: nextPhone });
  try {
    const consents = await catalog.consents();
    await me.setConsent('SMS', smsConsent, consents.SMS?.version ?? 'sms-2026-10');
  } catch {
    /* phone saved even if consent endpoint fails */
  }
  try {
    await me.sendPhoneCode();
  } catch {
    /* verification send is optional until the number flow is complete */
  }
  const session = await hydrateSession();
  if (!session) throw new Error('Could not refresh your account.');
  return session;
}

export async function clearPhone(userId: string) {
  void userId;
  await me.update({ phone: null });
  try {
    const consents = await catalog.consents();
    await me.setConsent('SMS', false, consents.SMS?.version ?? 'sms-2026-10');
  } catch {
    /* ignore */
  }
  const session = await hydrateSession();
  if (!session) throw new Error('Could not refresh your account.');
  return session;
}

export async function subscribeToPlan(userId: string, planId: PlanId) {
  void userId;
  const checkout = await billing.checkout(planId);
  const url = checkout.url || checkout.checkoutUrl;
  if (!url) throw new Error('Stripe checkout is not available for that plan yet.');
  window.location.assign(url);
  const session = readSession();
  if (!session) throw new Error('Log in to choose a plan.');
  return session;
}

function billingRedirect(payload: unknown) {
  if (!payload || typeof payload !== 'object') return '';
  const record = payload as Record<string, unknown>;
  for (const key of ['url', 'portalUrl', 'redirectUrl', 'sessionUrl']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export async function cancelSubscription(userId: string) {
  void userId;
  const portal = await billing.portal();
  const url = billingRedirect(portal);
  if (!url) throw new Error('The billing portal is not available yet.');
  window.location.assign(url);
  const session = readSession();
  if (!session) throw new Error('Log in to manage a subscription.');
  return session;
}

export async function verifyEmailToken(token: string) {
  await auth.verifyEmail(token);
}

export async function forgotPassword(email: string) {
  const value = email.trim().toLowerCase();
  if (!value) throw new Error('Enter an email.');
  await auth.forgotPassword(value);
}

export async function resetPasswordToken(token: string, newPassword: string) {
  const password = newPassword.trim();
  if (password.length < 8) throw new Error('Use a password of at least 8 characters.');
  await auth.resetPassword(token, password);
}
