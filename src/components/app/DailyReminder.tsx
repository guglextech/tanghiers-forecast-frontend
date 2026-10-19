'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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

function fireReminder(onOpen: () => void) {
  if (alreadyRemindedToday()) return;
  markRemindedToday();
  toast(TOAST.title, {
    description: TOAST.body,
    duration: 8000,
    action: {
      label: 'Open',
      onClick: onOpen,
    },
  });

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification('Tanghiers', {
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
  const router = useRouter();

  React.useEffect(() => {
    if (!ready || !user) return;

    const openFeed = () => router.push('/feed');
    const run = () => fireReminder(openFeed);

    const catchUp = window.setTimeout(() => {
      if (isAtOrAfterReminder()) run();
    }, 400);

    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        run();
        schedule();
      }, msUntilNextReminder());
    };
    schedule();

    const onVisible = () => {
      if (document.visibilityState === 'visible' && isAtOrAfterReminder()) run();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(catchUp);
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ready, user, router]);

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
