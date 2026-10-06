import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { FeedScreen } from '@/components/forecast/Screens';

export const metadata: Metadata = {
  title: 'Daily forecast',
  description: 'Today’s numbers and machine video for active subscribers.',
  robots: { index: false, follow: false },
};

export default function FeedPage() {
  return (
    <AppFrame>
      <FeedScreen />
    </AppFrame>
  );
}
