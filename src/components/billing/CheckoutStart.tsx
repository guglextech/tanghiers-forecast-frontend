'use client';

import * as React from 'react';
import Link from 'next/link';
import { LoadingState } from '@/components/app/LoadingState';
import { useSession } from '@/components/app/SessionProvider';
import { Button } from '@/components/ui/button';

export function CheckoutStart({ plan }: { plan: string }) {
  const { subscribeToPlan } = useSession();
  const started = React.useRef(false);
  const [error, setError] = React.useState('');
  const code = plan.trim().toLowerCase();

  React.useEffect(() => {
    if (!/^[a-z0-9-]+$/.test(code)) {
      setError('That plan is not available.');
      return;
    }
    if (started.current) return;
    started.current = true;
    void subscribeToPlan(code).catch((err) => {
      started.current = false;
      setError(err instanceof Error ? err.message : 'Could not open checkout.');
    });
  }, [code, subscribeToPlan]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <p className="text-sm text-[#b42318]">{error}</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LoadingState label="Opening checkout…" />
    </div>
  );
}
