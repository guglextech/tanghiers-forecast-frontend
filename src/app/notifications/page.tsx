import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { NotificationsScreen } from '@/components/account/NotificationsScreen';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Read and unread updates from the desk.',
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <AppFrame>
      <NotificationsScreen />
    </AppFrame>
  );
}
