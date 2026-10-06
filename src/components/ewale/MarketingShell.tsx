import type { ReactNode } from 'react';
import { PublicHeader } from '@/components/app/PublicChrome';
import SiteFooter from '@/components/SiteFooter';

/** Marketing pages: sticky nav + shared footer. */
export default function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
