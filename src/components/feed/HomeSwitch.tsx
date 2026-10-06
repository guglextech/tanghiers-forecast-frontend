'use client';

import { LoadingState } from '@/components/app/LoadingState';
import { useSession } from '@/components/app/SessionProvider';
import { FeedHome } from '@/components/feed/FeedHome';
import { GuestHome } from '@/components/feed/GuestHome';

export function HomeSwitch() {
  const { user, ready } = useSession();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)]">
        <LoadingState label="Loading…" />
      </div>
    );
  }

  return user ? <FeedHome /> : <GuestHome />;
}
