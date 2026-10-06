import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { MessagesScreen } from '@/components/account/MessagesScreen';

export const metadata: Metadata = {
  title: 'Delivery messages',
  description: 'Email, SMS, and site delivery for your forecasts.',
  robots: { index: false, follow: false },
};

export default function MessagesPage() {
  return (
    <AppFrame>
      <MessagesScreen />
    </AppFrame>
  );
}
