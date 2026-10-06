'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketingHome } from '@/components/home/MarketingHome';
import { useSession } from '@/components/app/SessionProvider';

export function HomeGate() {
  const { user, ready } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace('/feed');
  }, [ready, user, router]);

  if (!ready || user) {
    return <div className="min-h-screen bg-white" />;
  }

  return <MarketingHome />;
}
