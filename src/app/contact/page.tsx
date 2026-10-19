import type { Metadata } from 'next';
import { PublicFrame } from '@/components/chrome/Frames';
import { ContactForm } from '@/app/contact/ContactForm';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to the Tanghiers desk.',
};

export default function ContactPage() {
  return (
    <PublicFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Contact</h1>
      <p className="mt-1 text-sm leading-6 text-[#667085]">
        Questions about a subscription, a missing forecast, or your mobile number.
      </p>
      <p className="mt-3 text-sm text-[#667085]">
        Email{' '}
        <a href={`mailto:${SITE.email}`} className="font-medium text-[#101828] hover:underline">
          {SITE.email}
        </a>
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </PublicFrame>
  );
}
