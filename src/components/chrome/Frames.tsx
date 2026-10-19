'use client';

import {
  AppHeader,
  Disclaimer,
  PublicFooter,
  PublicHeader,
  shellClass,
} from '@/components/chrome/Chrome';
import { AppBottomNav, PublicBottomNav, bottomNavPad } from '@/components/chrome/BottomNav';
import { RequireAuth } from '@/components/app/RequireAuth';
import { cn } from '@/lib/utils';

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-white text-[#101828]">
        <AppHeader />
        <main className={cn(shellClass, bottomNavPad, 'flex-1 py-6 md:py-10')}>{children}</main>
        <Disclaimer />
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
