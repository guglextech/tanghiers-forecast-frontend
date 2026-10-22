import type { Metadata } from 'next';
import Link from 'next/link';
import { AdaptiveFrame } from '@/components/chrome/Frames';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'About',
  description: SITE.tagline,
};

const points = [
  {
    title: 'One forecast a day',
    body: 'The desk publishes the numbers and the draw video, live or on a schedule.',
  },
  {
    title: 'Subscribers only',
    body: 'Current and past forecasts stay closed until a plan is active. Then the same post is on the site, by email, and by SMS.',
  },
  {
    title: 'Online billing',
    body: 'Register, choose a plan, and pay with Stripe. No short code, USSD, or mobile money.',
  },
];

export default function AboutPage() {
  return (
    <AdaptiveFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">About</h1>
      <p className="mt-1 text-sm text-[#98a2b3]">
        One daily forecast, delivered to active subscribers.
      </p>

      <div className="mt-8 space-y-6">
        {points.map((point) => (
          <section key={point.title}>
            <h2 className="text-sm font-semibold text-[#101828]">{point.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#98a2b3]">{point.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-[#98a2b3]">{SITE.disclaimer}</p>

      <Link
        href="/pricing"
        className="mt-6 inline-flex h-9 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white hover:bg-[#1d2939]"
      >
        See plans
      </Link>
    </AdaptiveFrame>
  );
}
