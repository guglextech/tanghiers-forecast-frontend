'use client';

import * as React from 'react';
import { readDesk, subscribeDesk, type DeskState } from '@/lib/desk';

export function useDesk() {
  const [desk, setDesk] = React.useState<DeskState | null>(null);

  React.useEffect(() => {
    setDesk(readDesk());
    return subscribeDesk(() => setDesk(readDesk()));
  }, []);

  return desk;
}
