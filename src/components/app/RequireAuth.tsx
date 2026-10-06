'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingState } from '@/components/app/LoadingState';
import { useSession } from '@/components/app/SessionProvider';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!ready || user) return;
    const next = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : '';
    router.replace(`/login${next}`);
  }, [ready, user, pathname, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)]">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  return <>{children}</>;
}
