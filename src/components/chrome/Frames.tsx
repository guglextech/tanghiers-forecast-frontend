'use client';

import {
  Disclaimer,
  PublicFooter,
  PublicHeader,
  shellClass,
} from '@/components/chrome/Chrome';
import { AppSidebar, MobileAppHeader } from '@/components/chrome/AppSidebar';
import { AppBottomNav, PublicBottomNav, bottomNavPad } from '@/components/chrome/BottomNav';
import { RequireAuth } from '@/components/app/RequireAuth';
import { cn } from '@/lib/utils';

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-white text-[#101828]">
        <AppSidebar />
        <div className={cn('flex min-h-dvh min-w-0 flex-col md:pl-[232px]', bottomNavPad)}>
          <MobileAppHeader />
          <main className="flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
            <div className="mx-auto w-full max-w-3xl">{children}</div>
          </main>
          <Disclaimer compact />
        </div>
        <AppBottomNav />
      </div>
    </RequireAuth>
  );
}

export function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#101828]">
      <PublicHeader />
      <main className={cn(shellClass, bottomNavPad, 'flex-1 py-6 md:py-10')}>{children}</main>
      <PublicFooter />
      <PublicBottomNav />
    </div>
  );
}
