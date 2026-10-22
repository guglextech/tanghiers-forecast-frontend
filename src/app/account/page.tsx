import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { AccountScreen } from '@/components/account/AccountScreen';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your Tanghiers account and preferences.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <AppFrame>
      <AccountScreen />
    </AppFrame>
  );
}
