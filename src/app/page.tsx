import type { Metadata } from 'next';
import { HomeGate } from '@/components/home/HomeGate';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} — Daily forecasts`,
  },
  description: SITE.description,
};

export default function HomePage() {
  return <HomeGate />;
}
