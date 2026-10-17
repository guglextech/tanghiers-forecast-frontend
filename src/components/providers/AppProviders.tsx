'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SessionProvider } from '@/components/app/SessionProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { DailyReminder } from '@/components/app/DailyReminder';

/**
 * Dev-only: clear leftover Workbox/PWA workers from older builds.
 * Must not run in production or the installed PWA will never register.
 */
function UnregisterStaleServiceWorkers() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        void reg.unregister();
      });
    });
  }, []);
  return null;
}

function isStartTimeReportNoise(message: string, stack = '') {
  if (!message.includes("reading 'startTime'")) return false;
  // Message alone never includes the frame name — check stack.
  return (
    stack.includes('reportAllChanges') ||
    /at\s+\S*\.?reportAllChanges/.test(stack) ||
    stack.includes('<anonymous>')
  );
}

/**
 * Chrome DevTools Performance / Web Vitals hooks throw
 * `Cannot read properties of undefined (reading 'startTime')`
 * at `et.reportAllChanges` during client navigations (tooling noise).
 */
function SuppressDevtoolsPerfNoise() {
  React.useEffect(() => {
    function onError(event: ErrorEvent) {
      const message = event.message || event.error?.message || '';
      const stack = event.error?.stack || '';
      if (!isStartTimeReportNoise(message, stack)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function onUnhandled(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message =
        typeof reason === 'string'
          ? reason
          : reason instanceof Error
            ? reason.message
            : '';
      const stack = reason instanceof Error ? reason.stack || '' : '';
      if (!isStartTimeReportNoise(message, stack)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // Capture phase so we run before Next.js / React overlays.
    window.addEventListener('error', onError, true);
    window.addEventListener('unhandledrejection', onUnhandled, true);
    return () => {
      window.removeEventListener('error', onError, true);
      window.removeEventListener('unhandledrejection', onUnhandled, true);
    };
  }, []);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <UnregisterStaleServiceWorkers />
      <SuppressDevtoolsPerfNoise />
      <SessionProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <DailyReminder />
          <Toaster richColors closeButton position="top-right" />
        </TooltipProvider>
      </SessionProvider>
    </NextThemesProvider>
  );
}
