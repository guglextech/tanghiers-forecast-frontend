import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from '@/components/ui/icons';
import { AdaptiveFrame } from '@/components/chrome/Frames';
import { ContactForm } from '@/app/contact/ContactForm';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to LottoForecasts support for account, billing, or forecast questions.',
};

const topics = [
  {
    title: 'Account & billing',
    body: 'Sign-in, plan changes, and Stripe subscription questions.',
  },
  {
    title: 'Forecast delivery',
    body: 'Site access, optional email, and SMS notification preferences.',
  },
  {
    title: 'Messaging help',
    body: 'STOP and HELP for texts, or unsubscribe from forecast emails.',
  },
];

export default function ContactPage() {
  return (
    <AdaptiveFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Contact</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#667085]">
        Questions about your account, subscription, or daily forecasts. Send a note below, or email
        the desk directly.
      </p>

      <a
        href={`mailto:${SITE.email}`}
        className="mt-6 inline-flex items-center gap-3 text-sm transition-colors hover:text-[#101828]"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#101828]">
          <Mail className="size-3.5" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-xs text-[#98a2b3]">Email</span>
          <span className="block truncate font-medium text-[#101828]">{SITE.email}</span>
        </span>
      </a>

      <div className="mt-8">
        <ContactForm />
      </div>

      <div className="mt-10 space-y-5">
        {topics.map((topic) => (
          <section key={topic.title}>
            <h2 className="text-sm font-medium text-[#101828]">{topic.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#667085]">{topic.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm leading-6 text-[#667085]">
        Optional SMS and email notifications are covered in the{' '}
        <Link href="/messaging" className="font-medium text-[#101828] hover:underline">
          messaging policy
        </Link>
        .
      </p>
    </AdaptiveFrame>
  );
}
