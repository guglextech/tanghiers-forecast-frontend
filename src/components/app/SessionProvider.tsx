'use client';

import * as React from 'react';
import {
  cancelSubscription,
  clearPhone,
  clearSession,
  loginAccount,
  readSession,
  savePhone,
  signupAccount,
  subscribeToPlan,
  type SessionUser,
} from '@/lib/session';
import type { PlanId } from '@/data/site';

type SessionContextValue = {
  user: SessionUser | null;
  ready: boolean;
  login: (input: { email: string; password: string }) => SessionUser;
  signup: (input: { name: string; email: string; password: string }) => SessionUser;
  logout: () => void;
  savePhone: (phone: string, smsConsent: boolean) => SessionUser;
  clearPhone: () => SessionUser;
  subscribeToPlan: (planId: PlanId) => SessionUser;
  cancelSubscription: () => SessionUser;
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setUser(readSession());
    setReady(true);
  }, []);

  const value = React.useMemo<SessionContextValue>(
    () => ({
      user,
      ready,
      login: (input) => {
        const next = loginAccount(input);
        setUser(next);
        return next;
      },
      signup: (input) => {
        const next = signupAccount(input);
        setUser(next);
        return next;
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
      savePhone: (phone, smsConsent) => {
        if (!user) throw new Error('Log in to save a mobile number.');
        const next = savePhone(user.id, phone, smsConsent);
        setUser(next);
        return next;
      },
      clearPhone: () => {
        if (!user) throw new Error('Log in to update your mobile number.');
        const next = clearPhone(user.id);
        setUser(next);
        return next;
      },
      subscribeToPlan: (planId) => {
        if (!user) throw new Error('Log in to choose a plan.');
        const next = subscribeToPlan(user.id, planId);
        setUser(next);
        return next;
      },
      cancelSubscription: () => {
        if (!user) throw new Error('Log in to manage a subscription.');
        const next = cancelSubscription(user.id);
        setUser(next);
        return next;
      },
    }),
    [user, ready],
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
