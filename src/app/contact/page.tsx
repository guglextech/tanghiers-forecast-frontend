import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
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
        className="mt-6 flex items-center gap-3 rounded-2xl border border-[#eef0f3] bg-[#fafbfc] px-4 py-3.5 transition-colors hover:border-[#d0d5dd] hover:bg-white"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#101828] ring-1 ring-[#eef0f3]">
          <Mail className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-xs text-[#98a2b3]">Email</span>
          <span className="block truncate text-sm font-medium text-[#101828]">{SITE.email}</span>
        </span>
      </a>

      <div className="mt-8">
        <ContactForm />
      </div>

      <div className="mt-10 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
        {topics.map((topic) => (
          <section key={topic.title} className="py-4">
            <h2 className="text-sm font-medium text-[#101828]">{topic.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#667085]">{topic.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-6 text-sm leading-6 text-[#667085]">
        Optional SMS and email notifications are covered in the{' '}
        <Link href="/messaging" className="font-medium text-[#101828] hover:underline">
          messaging policy
        </Link>
        .
      </p>
    </AdaptiveFrame>
  );
}
