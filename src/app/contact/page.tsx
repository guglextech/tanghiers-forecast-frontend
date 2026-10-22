import type { Metadata } from 'next';
import { AdaptiveFrame } from '@/components/chrome/Frames';
import { ContactForm } from '@/app/contact/ContactForm';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Help',
  description: 'Write to the Tanghiers desk.',
};

export default function ContactPage() {
  return (
    <AdaptiveFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Help</h1>
      <p className="mt-1 text-sm text-[#98a2b3]">
        Write to the desk, or email{' '}
        <a href={`mailto:${SITE.email}`} className="text-[#101828] hover:underline">
          {SITE.email}
        </a>
        .
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </AdaptiveFrame>
  );
}
