import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicFrame } from '@/components/chrome/Frames';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of use for LottoForecasts.com, operated by Tanghiers Group LLC.',
};

const sections = [
  {
    title: 'The service',
    body: 'LottoForecasts.com provides a paid informational and entertainment subscription featuring manually prepared lottery-related numerical forecasts for national lottery games in the USA. An active subscription opens the forecast on the site, and optional email and SMS notifications may deliver the same content if you opt in.',
  },
  {
    title: 'Informational and entertainment only',
    body: 'Forecasts are for informational and entertainment purposes only. They are not guarantees of winning outcomes and are not recommendations to place any wager. Lottery games are games of chance. Play responsibly. We make no warranty about the accuracy, completeness, or reliability of anything on this site.',
  },
  {
    title: 'What subscription fees cover',
    body: 'Subscription fees pay for access to forecasting content only. They do not pay for lottery entries, winnings, or any lottery outcome. LottoForecasts does not accept or facilitate wagers, sell lottery tickets, operate lottery drawings, award prizes, or guarantee results.',
  },
  {
    title: 'Unofficial',
    body: 'LottoForecasts.com is an unofficial website. It is not affiliated with, endorsed by, or associated with the national lotteries of the USA or any state lottery organization. The site is operated by Tanghiers Group LLC.',
  },
  {
    title: 'Subscriptions',
    body: 'Plans renew through Stripe until you cancel. Canceling closes forecast access at the end of the current period. Taxes, where they apply, are added by the payment provider.',
  },
  {
    title: 'Optional SMS and email notifications',
    body: 'Messaging consent is optional and is not a condition of purchase or use of the service. You may enroll during registration or later in account preferences. Frequency is up to one daily forecast message per enrolled channel, plus any necessary confirmation or opt-out messages. SMS message and data rates may apply according to your carrier plan. Reply STOP to cancel SMS, or HELP for assistance. Email includes an unsubscribe link. Full details are in the Messaging policy.',
  },
  {
    title: 'Accounts',
    body: 'Keep your login to yourself. We may close an account that disrupts the service or misuses another person’s details.',
  },
];

export default function TermsPage() {
  return (
    <PublicFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Terms</h1>
      <p className="mt-1 text-sm leading-6 text-[#667085]">
        These terms cover use of LottoForecasts.com, operated by Tanghiers Group LLC.
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
        Messaging:{' '}
        <Link href="/messaging" className="font-medium text-[#101828] hover:underline">
          Messaging policy
        </Link>
        {' · '}
        Questions:{' '}
        <Link href="/contact" className="font-medium text-[#101828] hover:underline">
          Contact
        </Link>
        {' · '}
        <a className="font-medium text-[#101828] hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </p>
    </PublicFrame>
  );
}
