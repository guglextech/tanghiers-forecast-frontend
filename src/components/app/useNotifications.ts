'use client';

import * as React from 'react';
import { useDesk } from '@/components/forecast/useDesk';
import { useSession } from '@/components/app/SessionProvider';
import {
  listNotifications,
  markAllNoticesRead,
  markNoticeRead,
  subscribeNotifications,
  type Notice,
} from '@/lib/notifications';

export function useNotifications() {
  const { user } = useSession();
  const desk = useDesk();
  const [items, setItems] = React.useState<Notice[]>([]);

  React.useEffect(() => {
    if (!user || !desk) return;
    const load = () => setItems(listNotifications(user, desk.forecasts, desk.deliveries));
    load();
    return subscribeNotifications(load);
  }, [user, desk]);

  const unreadCount = items.filter((notice) => !notice.read).length;

  const markRead = React.useCallback(
    (id: string) => {
      if (!user) return;
      markNoticeRead(user.id, id);
    },
    [user],
  );

  const markAllRead = React.useCallback(() => {
    if (!user) return;
    markAllNoticesRead(user.id);
  }, [user]);

  return { items, unreadCount, markRead, markAllRead, ready: Boolean(user && desk) };
}
