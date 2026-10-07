import { addDaysIso, todayIsoDate } from '@/lib/dates';
import { planById, type PlanId } from '@/data/site';

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
  email: string;
  role: Role;
  phone: string;
  smsConsent: boolean;
  planId: PlanId | null;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  invoices: Invoice[];
};

type StoredUser = SessionUser & {
  password: string;
};

const SESSION_KEY = 'tg.session.v1';
const USERS_KEY = 'tg.users.v1';

const DEMO_USERS: StoredUser[] = [
  {
    id: 'usr_subscriber',
    name: 'Ama Mensah',
    email: 'subscriber@lottoforecast.test',
    password: 'lotto123',
    role: 'member',
    phone: '+233550982043',
    smsConsent: true,
    planId: 'monthly',
    subscriptionStatus: 'active',
    currentPeriodEnd: '2026-11-06',
    invoices: [
      {
        id: 'in_1006',
        date: '2026-10-06',
        label: 'Monthly subscription',
        amount: 12,
        status: 'Paid',
      },
    ],
  },
  {
    id: 'usr_member',
    name: 'Kwesi Boateng',
    email: 'member@lottoforecast.test',
    password: 'lotto123',
    role: 'member',
    phone: '',
    smsConsent: false,
    planId: null,
    subscriptionStatus: 'inactive',
    currentPeriodEnd: null,
    invoices: [],
  },
  {
    id: 'usr_admin',
    name: 'Efua Darko',
    email: 'admin@lottoforecast.test',
    password: 'lotto123',
    role: 'admin',
    phone: '',
    smsConsent: false,
    planId: null,
    subscriptionStatus: 'inactive',
    currentPeriodEnd: null,
    invoices: [],
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readStoredUsers(): StoredUser[] {
  if (!canUseStorage()) return DEMO_USERS.map((user) => ({ ...user, invoices: [...user.invoices] }));
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    const users = Array.isArray(parsed) ? parsed : [];
    let changed = false;
    for (const demo of DEMO_USERS) {
      if (!users.some((user) => user.email === demo.email)) {
        users.push({ ...demo, invoices: [...demo.invoices] });
        changed = true;
      }
    }
    if (!raw || changed) {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return DEMO_USERS.map((user) => ({ ...user, invoices: [...user.invoices] }));
  }
}

function writeStoredUsers(users: StoredUser[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function toSessionUser(user: StoredUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    smsConsent: user.smsConsent,
    planId: user.planId,
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
    invoices: user.invoices ?? [],
  };
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

export function readSession(): SessionUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed?.email) return null;
    const fresh = readStoredUsers().find((user) => user.id === parsed.id || user.email === parsed.email);
    return fresh ? toSessionUser(fresh) : parsed;
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function listAccounts(): SessionUser[] {
  return readStoredUsers()
    .map(toSessionUser)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function persistUser(next: StoredUser) {
  const users = readStoredUsers().map((user) => (user.id === next.id ? next : user));
  writeStoredUsers(users);
  const session = readSession();
  if (session?.id === next.id) writeSession(toSessionUser(next));
  return toSessionUser(next);
}

export function signupAccount(input: { name: string; email: string; password: string }): SessionUser {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name || !email || password.length < 6) {
    throw new Error('Enter your name, email, and a password of at least 6 characters.');
  }

  const users = readStoredUsers();
  if (users.some((user) => user.email === email)) {
    throw new Error('An account with that email already exists. Log in instead.');
  }

  const user: StoredUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    password,
    role: 'member',
    phone: '',
    smsConsent: false,
    planId: null,
    subscriptionStatus: 'inactive',
    currentPeriodEnd: null,
    invoices: [],
  };
  writeStoredUsers([...users, user]);
  const session = toSessionUser(user);
  writeSession(session);
  return session;
}

export function loginAccount(input: { email: string; password: string }): SessionUser {
  const email = input.email.trim().toLowerCase();
  const user = readStoredUsers().find((entry) => entry.email === email);

  if (!user || !user.password || user.password !== input.password) {
    throw new Error('That email or password is not right.');
  }

  const session = toSessionUser(user);
  writeSession(session);
  return session;
}

const GOOGLE_EMAIL = 'google@lottoforecast.test';

export function continueWithGoogle(): SessionUser {
  const users = readStoredUsers();
  const existing = users.find((entry) => entry.email === GOOGLE_EMAIL);
  if (existing) {
    const session = toSessionUser(existing);
    writeSession(session);
    return session;
  }

  const user: StoredUser = {
    id: 'usr_google',
    name: 'Google account',
    email: GOOGLE_EMAIL,
    password: '',
    role: 'member',
    phone: '',
    smsConsent: false,
    planId: null,
    subscriptionStatus: 'inactive',
    currentPeriodEnd: null,
    invoices: [],
  };
  writeStoredUsers([...users, user]);
  const session = toSessionUser(user);
  writeSession(session);
  return session;
}

const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export function savePhone(userId: string, phone: string, smsConsent: boolean) {
  const nextPhone = phone.trim().replace(/\s+/g, '');
  if (!PHONE_PATTERN.test(nextPhone)) {
    throw new Error('Enter a mobile number with a country code, for example +233550982043.');
  }
  const user = readStoredUsers().find((entry) => entry.id === userId);
  if (!user) throw new Error('Account not found.');
  return persistUser({ ...user, phone: nextPhone, smsConsent });
}

export function clearPhone(userId: string) {
  const user = readStoredUsers().find((entry) => entry.id === userId);
  if (!user) throw new Error('Account not found.');
  return persistUser({ ...user, phone: '', smsConsent: false });
}

const PERIOD_DAYS: Record<PlanId, number> = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
};

export function subscribeToPlan(userId: string, planId: PlanId) {
  const user = readStoredUsers().find((entry) => entry.id === userId);
  if (!user) throw new Error('Account not found.');
  const plan = planById(planId);
  if (!plan) throw new Error('Choose a plan.');
  const invoice: Invoice = {
    id: `in_${Date.now()}`,
    date: todayIsoDate(),
    label: `${plan.name} subscription`,
    amount: plan.price,
    status: 'Paid',
  };
  return persistUser({
    ...user,
    planId,
    subscriptionStatus: 'active',
    currentPeriodEnd: addDaysIso(PERIOD_DAYS[planId]),
    invoices: [invoice, ...(user.invoices ?? [])],
  });
}

export function cancelSubscription(userId: string) {
  const user = readStoredUsers().find((entry) => entry.id === userId);
  if (!user) throw new Error('Account not found.');
  return persistUser({
    ...user,
    planId: null,
    subscriptionStatus: 'canceled',
    currentPeriodEnd: null,
  });
}
