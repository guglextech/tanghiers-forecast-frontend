import type { Metadata } from 'next';
import { PublicFrame } from '@/components/chrome/Frames';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description: `How ${SITE.name} handles account, billing, and delivery information.`,
};

const sections = [
  {
    title: 'Account',
    body: 'We keep the name, email, and password you use to sign in, plus the plan status on the account. In this preview those details stay in your browser.',
  },
  {
    title: 'Mobile number and text consent',
    body: 'If you save a mobile number, we store the number and whether you agreed to texts. Saving either one only records the choice. The number is not verified, and nothing is sent while text delivery is inactive.',
  },
  {
    title: 'Payments',
    body: 'Subscriptions are billed with Stripe. Card numbers are handled by Stripe. This product stores the plan, the payment status, and a simple invoice record, not the card.',
  },
  {
    title: 'Forecast delivery',
    body: 'When a forecast is published, we record that it was made available on the site and sent by email. SMS is recorded as queued until text delivery is connected through Twilio. An email provider sends account, subscription, and forecast mail.',
  },
  {
    title: 'What we do not do',
    body: 'We do not sell subscriber lists. We do not use short codes, USSD, or mobile money to collect payment or phone numbers.',
  },
];

export default function PrivacyPage() {
  return (
    <PublicFrame>
      <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-4 text-[15px] leading-7 text-[#475467]">
          This note describes the information Lotto Forecast uses to run accounts, subscriptions, and
          forecast delivery.
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#475467]">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-[#667085]">
          Questions: <a className="font-medium text-[#101828] hover:underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
      </article>
    </PublicFrame>
  );
}
