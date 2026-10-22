'use client';

import * as React from 'react';
import { loadDesk, readDesk, subscribeDesk, type DeskState } from '@/lib/desk';
import { useSession } from '@/components/app/SessionProvider';

export function useDesk() {
  const { user, ready } = useSession();
  const [desk, setDesk] = React.useState<DeskState | null>(null);

  React.useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void loadDesk().then((state) => {
      if (!cancelled) setDesk(state);
    });
    return subscribeDesk(() => {
      if (!cancelled) setDesk(readDesk());
    });
  }, [ready, user?.id, user?.role]);

  return desk;
}
