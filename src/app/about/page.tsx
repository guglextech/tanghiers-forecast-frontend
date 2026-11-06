import type { Metadata } from 'next';
import Link from 'next/link';
import { AdaptiveFrame } from '@/components/chrome/Frames';

export const metadata: Metadata = {
  title: 'About',
  description:
    'LottoForecasts.com publishes manually prepared lottery-related numerical forecasts for informational and entertainment purposes. Results are not guaranteed.',
};

const sections = [
  {
    title: 'How forecasts are made',
    body: 'Each day, our team prepares lottery-related numerical forecasts through independent review and analysis. The forecasting process is carried out manually. We do not use artificial intelligence.',
  },
  {
    title: 'What a subscription covers',
    body: 'Subscription fees pay for access to forecasting content only. They do not pay for lottery entries, winnings, or any lottery outcome. LottoForecasts does not accept or facilitate wagers, sell lottery tickets, operate lottery drawings, award prizes, or guarantee results.',
  },
  {
    title: 'Informational and entertainment only',
    body: 'LottoForecasts.com is for informational and entertainment purposes only. Forecasts are not guarantees of winning outcomes and are not recommendations to place any wager. Lottery games are games of chance, and users should play responsibly.',
  },
  {
    title: 'Important disclaimer',
    body: 'LottoForecasts.com is an unofficial website. It is not affiliated with, endorsed by, or associated with the national lotteries of the USA or any state lottery organization. All content on this website is operated by Tanghiers Group LLC.',
  },
];

export default function AboutPage() {
  return (
    <AdaptiveFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">About</h1>
      <p className="mt-2 text-sm leading-6 text-[#667085]">
        Welcome to LottoForecasts.com, a growing community for lottery enthusiasts who enjoy
        following daily number forecasts across national lottery games in the USA.
      </p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-semibold text-[#101828]">{section.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#667085]">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm leading-6 text-[#667085]">
        If you spot an error, have a question, or want to share feedback, use the{' '}
        <Link href="/contact" className="font-medium text-[#101828] hover:underline">
          Contact
        </Link>{' '}
        page. Optional SMS and email notifications are covered in the{' '}
        <Link href="/messaging" className="font-medium text-[#101828] hover:underline">
          messaging policy
        </Link>
        .
      </p>

      <Link
        href="/pricing"
        className="mt-6 inline-flex h-9 items-center rounded-[var(--radius)] bg-[#101828] px-4 text-sm font-semibold text-white hover:bg-[#1d2939]"
      >
        See plans
      </Link>
    </AdaptiveFrame>
  );
}
