'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useSession } from '@/components/app/SessionProvider';
import {
  alreadyRemindedToday,
  isAtOrAfterReminder,
  markRemindedToday,
  msUntilNextReminder,
} from '@/lib/reminder';

const TOAST = {
  title: 'Today’s forecast is ready',
  body: 'Open the feed to see the numbers and play the draw.',
};

function fireReminder() {
  if (alreadyRemindedToday()) return;
  markRemindedToday();
  toast(TOAST.title, { description: TOAST.body, duration: 8000 });

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification('Lotto Forecast', {
      body: TOAST.body,
      icon: '/icons/icon-192.png',
      tag: 'lotto-forecast-2pm',
    });
  } catch {
    /* Some browsers require a service worker for notifications. */
  }
}

export function DailyReminder() {
  const { user, ready } = useSession();

  React.useEffect(() => {
    if (!ready || !user) return;

    if (isAtOrAfterReminder()) fireReminder();

    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        fireReminder();
        schedule();
      }, msUntilNextReminder());
    };
    schedule();

    const onVisible = () => {
      if (document.visibilityState === 'visible' && isAtOrAfterReminder()) {
        fireReminder();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ready, user]);

  React.useEffect(() => {
    if (!ready || !user) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    const wait = window.setTimeout(() => {
      void Notification.requestPermission();
    }, 1200);
    return () => window.clearTimeout(wait);
  }, [ready, user]);

  return null;
}
