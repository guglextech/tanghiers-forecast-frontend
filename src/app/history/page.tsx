import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { HistoryScreen } from '@/components/forecast/Screens';

export const metadata: Metadata = {
  title: 'Forecast history',
  description: 'Current and past Tanghiers posts.',
  robots: { index: false, follow: false },
};

export default function HistoryPage() {
  return (
    <AppFrame>
      <HistoryScreen />
    </AppFrame>
  );
}
