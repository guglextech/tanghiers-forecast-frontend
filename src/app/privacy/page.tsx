import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicFrame } from '@/components/chrome/Frames';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description: `How ${SITE.name.trim()} handles account, billing, and messaging information.`,
};

const sections = [
  {
    title: 'Account',
    body: 'We keep the name, email, and password you use to sign in, plus the plan status on the account.',
  },
  {
    title: 'Mobile number and messaging consent',
    body: 'If you enroll in optional SMS or email forecast notifications, we collect your mobile number and/or email address, your consent selection, the date and time of consent, and your messaging preferences and opt-out status. We retain records of the disclosure and method used to obtain consent. Consent is optional and is not a condition of purchase or use of the service.',
  },
  {
    title: 'How we use contact information',
    body: 'We use this information solely to send the requested forecasts, maintain consent and unsubscribe records, provide support, prevent unauthorized messages, and comply with applicable messaging laws. We do not sell or share your mobile number, email address, or consent information with third parties or affiliates for their marketing or promotional purposes.',
  },
  {
    title: 'Payments',
    body: 'Subscriptions are billed with Stripe. Card numbers are handled by Stripe. This product stores the plan, the payment status, and a simple invoice record, not the card. Subscription fees pay for access to forecasting content only.',
  },
  {
    title: 'Forecast delivery',
    body: 'When a forecast is published, we may make it available on the site and, if you opted in, send it by email and/or SMS. We use trusted messaging service providers, including Twilio for SMS and SendGrid for email, only as necessary to deliver the messages you have requested. Delivery is provided on an as-is and as-available basis.',
  },
  {
    title: 'What we do not do',
    body: 'We do not sell subscriber lists. We do not accept wagers, sell lottery tickets, operate drawings, or award prizes. We do not use short codes, USSD, or mobile money to collect payment or phone numbers.',
  },
];

export default function PrivacyPage() {
  return (
    <PublicFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Privacy</h1>
      <p className="mt-1 text-sm leading-6 text-[#667085]">
        How LottoForecasts uses account, billing, and messaging information.
      </p>
      <div className="mt-8 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
        {sections.map((section) => (
          <section key={section.title} className="py-4">
            <h2 className="text-[15px] font-medium">{section.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-[#667085]">{section.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-6 text-sm text-[#667085]">
        Messaging details:{' '}
        <Link href="/messaging" className="font-medium text-[#101828] hover:underline">
          Messaging policy
        </Link>
        . Questions:{' '}
        <a className="font-medium text-[#101828] hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </p>
    </PublicFrame>
  );
}
