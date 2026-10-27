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
    body: 'LottoForecasts.com publishes daily number forecasts for national lottery games in the USA. Forecasts are prepared with dedicated draw machines and reviewed manually. We do not use artificial intelligence. An active subscription opens the forecast on the site, by email, and by SMS.',
  },
  {
    title: 'Infotainment, not a guarantee',
    body: 'Forecasts are for infotainment only. They are predictions, not guarantees of future lottery results. Lottery games are games of chance. Play responsibly. We make no warranty about the accuracy, completeness, or reliability of anything on this site, and a forecast is not an instruction to place a wager.',
  },
  {
    title: 'Unofficial',
    body: 'LottoForecasts.com is an unofficial website. It is not affiliated with, endorsed by, or associated with the national lotteries of the USA or any state lottery organization. The site is operated by Tanghiers Group LLC.',
  },
  {
    title: 'Subscriptions',
    body: 'Subscriptions help support the draw machines, daily publishing, and the website. Plans renew through Stripe until you cancel. Canceling closes forecast access. Taxes, where they apply, are added by the payment provider.',
  },
  {
    title: 'Texts',
    body: 'Text consent is optional. Until text delivery is active, saving a number or consent only records your choice. You can remove the number from your account at any time.',
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
        Questions and corrections:{' '}
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
