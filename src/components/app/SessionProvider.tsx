'use client';

import * as React from 'react';
import {
  cancelSubscription,
  clearPhone,
  continueWithGoogle as continueWithGoogleAccount,
  deleteAccount,
  exportAccountData,
  hydrateSession,
  completeMfaEnroll,
  completeMfaVerify,
  loginAccount,
  logoutAccount,
  savePhone,
  signupAccount,
  subscribeToPlan,
  updateProfile,
  type SessionUser,
  type SignupInput,
} from '@/lib/session';
import type { PlanId } from '@/data/site';

type SessionContextValue = {
  user: SessionUser | null;
  ready: boolean;
  login: (input: { email: string; password: string }) => Promise<SessionUser>;
  signup: (input: SignupInput) => Promise<SessionUser>;
  continueWithGoogle: () => Promise<SessionUser>;
  verifyMfa: (code: string) => Promise<SessionUser>;
  confirmMfaSetup: (code: string) => Promise<{ user: SessionUser; recoveryCodes: string[] }>;
  logout: () => void;
  refresh: () => Promise<SessionUser | null>;
  updateProfile: (input: {
    firstName: string;
    lastName: string;
    timezone: string;
    phone: string;
    smsConsent: boolean;
  }) => Promise<SessionUser>;
  savePhone: (phone: string, smsConsent: boolean) => Promise<SessionUser>;
  clearPhone: () => Promise<SessionUser>;
  exportAccount: () => Promise<unknown>;
  deleteAccount: (password: string) => Promise<void>;
  subscribeToPlan: (planId: PlanId) => Promise<SessionUser>;
  cancelSubscription: () => Promise<SessionUser>;
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    void hydrateSession()
      .then(setUser)
      .finally(() => setReady(true));
  }, []);

  const refresh = React.useCallback(async () => {
    const next = await hydrateSession();
    setUser(next);
    return next;
  }, []);

  const value = React.useMemo<SessionContextValue>(
    () => ({
      user,
      ready,
      login: async (input) => {
        const next = await loginAccount(input);
        setUser(next);
        return next;
      },
      signup: async (input) => {
        const next = await signupAccount(input);
        setUser(next);
        return next;
      },
      continueWithGoogle: async () => {
        const next = await continueWithGoogleAccount();
        setUser(next);
        return next;
      },
      verifyMfa: async (code) => {
        const next = await completeMfaVerify(code);
        setUser(next);
        return next;
      },
      confirmMfaSetup: async (code) => {
        const result = await completeMfaEnroll(code);
        setUser(result.user);
        return result;
      },
      logout: () => {
        void logoutAccount();
        setUser(null);
      },
      refresh,
      updateProfile: async (input) => {
        if (!user) throw new Error('Log in to update your profile.');
        const next = await updateProfile(input);
        setUser(next);
        return next;
      },
      savePhone: async (phone, smsConsent) => {
        if (!user) throw new Error('Log in to save a mobile number.');
        const next = await savePhone(user.id, phone, smsConsent);
        setUser(next);
        return next;
      },
      clearPhone: async () => {
        if (!user) throw new Error('Log in to update your mobile number.');
        const next = await clearPhone(user.id);
        setUser(next);
        return next;
      },
      exportAccount: () => exportAccountData(),
      deleteAccount: async (password) => {
        if (!user) throw new Error('Log in to delete your account.');
        await deleteAccount(password);
        setUser(null);
      },
      subscribeToPlan: async (planId) => {
        if (!user) throw new Error('Log in to choose a plan.');
        const next = await subscribeToPlan(user.id, planId);
        setUser(next);
        return next;
      },
      cancelSubscription: async () => {
        if (!user) throw new Error('Log in to manage a subscription.');
        const next = await cancelSubscription(user.id);
        setUser(next);
        return next;
      },
    }),
    [user, ready, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
