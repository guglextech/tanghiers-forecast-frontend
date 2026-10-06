'use client';

import { AppHeader, Disclaimer, PublicFooter, PublicHeader } from '@/components/chrome/Chrome';
import { RequireAuth } from '@/components/app/RequireAuth';

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-white text-[#101828]">
        <AppHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
        <Disclaimer />
      </div>
    </RequireAuth>
  );
}

export function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#101828]">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
