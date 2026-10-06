'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app/AppSidebar';
import { AppTopbar } from '@/components/app/AppTopbar';
import { MobileBottomNav } from '@/components/app/MobileBottomNav';
import { CommandSearch } from '@/components/app/CommandSearch';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-[var(--page-bg)] text-foreground">
      <div className="flex min-h-screen min-w-0">
        <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
          <AppSidebar />
        </div>

        <div className="flex min-h-screen min-w-0 w-full flex-1 flex-col lg:pl-60">
          <AppTopbar onOpenSearch={() => setSearchOpen(true)} />
          <main className="min-w-0 flex-1 px-4 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 md:px-8 md:py-7 lg:pb-8">
            <div className="mx-auto w-full min-w-0 max-w-2xl">{children}</div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
