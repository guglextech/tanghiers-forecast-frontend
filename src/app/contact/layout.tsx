import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help',
  description: 'Write to the Tanghiers desk.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
