import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to the Lotto Forecast desk.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
