import type { Metadata } from 'next';
import { PublicFrame } from '@/components/chrome/Frames';
import { ContactForm } from '@/app/contact/ContactForm';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to the Lotto Forecast desk.',
};

export default function ContactPage() {
  return (
    <PublicFrame>
      <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#475467]">
            Questions about a subscription, a missing forecast, or your mobile number can come here.
          </p>
          <p className="mt-6 text-sm text-[#667085]">
            Email{' '}
            <a href={`mailto:${SITE.email}`} className="font-medium text-[#101828] hover:underline">
              {SITE.email}
            </a>
          </p>
        </div>
        <ContactForm />
      </div>
    </PublicFrame>
  );
}
