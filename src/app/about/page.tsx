import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicFrame } from '@/components/chrome/Frames';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'About',
  description: SITE.tagline,
};

const points = [
  {
    title: 'One forecast a day',
    body: 'The desk creates the numbers, attaches the machine video, and publishes immediately or on a schedule.',
  },
  {
    title: 'Subscribers only',
    body: 'Current and past forecasts stay closed until a plan is active. The same post is then available on the site, by email, and by SMS.',
  },
  {
    title: 'Online billing',
    body: 'People register, choose a plan, and pay with Stripe. There is no short code, USSD menu, or mobile-money checkout.',
  },
];

export default function AboutPage() {
  return (
    <PublicFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">About</h1>
      <p className="mt-1 text-sm leading-6 text-[#667085]">
        Lotto Forecast is a {SITE.project} product. One daily forecast, delivered to active
        subscribers.
      </p>
      <p className="mt-5 text-[15px] leading-6 text-[#475467]">
        It follows the same desk rhythm as TG’s LGM and DV products: prepare the forecast, publish
        it, and let delivery run. The difference is the sale. This product is a direct online
        subscription.
      </p>
      <div className="mt-8 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
        {points.map((point) => (
          <section key={point.title} className="py-4">
            <h2 className="text-[15px] font-medium">{point.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-[#667085]">{point.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-6 text-sm leading-6 text-[#667085]">
        {SITE.disclaimer} A forecast is not a promise of a result, and it is not an instruction to
        place a wager.
      </p>
      <Link
        href="/pricing"
        className="mt-6 inline-flex h-10 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white hover:bg-[#1d2939]"
      >
        See plans
      </Link>
    </PublicFrame>
  );
}
