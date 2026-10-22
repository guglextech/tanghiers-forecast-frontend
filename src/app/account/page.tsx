import type { Metadata } from 'next';
import { AppFrame } from '@/components/chrome/Frames';
import { AccountScreen } from '@/components/account/AccountScreen';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Your Tanghiers profile, mobile number, and account data.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <AppFrame>
      <AccountScreen />
    </AppFrame>
  );
}
