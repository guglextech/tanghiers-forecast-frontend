import type { Metadata } from 'next';
import Link from 'next/link';
import { AdaptiveFrame } from '@/components/chrome/Frames';

export const metadata: Metadata = {
  title: 'About',
  description:
    'LottoForecasts.com publishes daily number forecasts for national lottery games in the USA. Forecasts are for infotainment and are not guaranteed.',
};

const sections = [
  {
    title: 'How forecasts are made',
    body: 'Each day, our team runs dedicated draw machines and manually reviews the results to publish forecasts for our community. We do not use artificial intelligence. The forecasting process is carried out manually.',
  },
  {
    title: 'What a subscription supports',
    body: 'Subscriptions help support the ongoing operation of our draw machines, daily publishing, website maintenance, and the community we are building together.',
  },
  {
    title: 'Infotainment, not a guarantee',
    body: 'LottoForecasts.com is for infotainment only. Forecasts are predictions, not guarantees of future lottery results. Lottery games are games of chance, and users should play responsibly. We take care when preparing and posting forecasts, and we make no warranty about the accuracy, completeness, or reliability of anything on this site.',
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
        page. You can also subscribe for daily forecasts, site updates, and community news.
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
