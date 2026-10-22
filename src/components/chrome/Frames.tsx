'use client';

import type { ReactNode } from 'react';
import {
  Disclaimer,
  PublicFooter,
  PublicHeader,
  contentWidth,
  shellClass,
} from '@/components/chrome/Chrome';
import { AppSidebar, MobileAppHeader } from '@/components/chrome/AppSidebar';
import { AppBottomNav, PublicBottomNav, bottomNavPad } from '@/components/chrome/BottomNav';
import { RequireAuth } from '@/components/app/RequireAuth';
import { LoadingState } from '@/components/app/LoadingState';
import { useSession } from '@/components/app/SessionProvider';
import { cn } from '@/lib/utils';

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-white text-[#101828]">
      <AppSidebar />
      <div className={cn('flex min-h-dvh min-w-0 flex-col md:pl-[232px]', bottomNavPad)}>
        <MobileAppHeader />
        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-10">
          <div className={contentWidth}>{children}</div>
        </main>
        <Disclaimer compact />
      </div>
      <AppBottomNav />
    </div>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

export function PublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#101828]">
      <PublicHeader />
      <main className={cn(shellClass, bottomNavPad, 'flex-1 py-6 md:py-10')}>{children}</main>
      <PublicFooter />
      <PublicBottomNav />
    </div>
  );
}

export function AdaptiveFrame({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <LoadingState label="Loading…" />
      </div>
    );
  }

  if (user) return <AppShell>{children}</AppShell>;
  return <PublicFrame>{children}</PublicFrame>;
}
