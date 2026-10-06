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
      <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-sm font-medium text-[#667085]">About {SITE.project}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Lotto Forecast</h1>
        <p className="mt-5 text-base leading-7 text-[#475467]">
          Lotto Forecast is a {SITE.project} product for publishing a daily lotto forecast and
          delivering it to active subscribers. It follows the same desk rhythm as TG’s LGM and DV
          products: prepare the forecast, publish it, and let delivery run. The difference is the
          sale. This product is a direct online subscription.
        </p>
        <div className="mt-10 grid gap-4">
          {points.map((point) => (
            <section key={point.title} className="rounded-2xl border border-[#e6e8ee] px-5 py-5">
              <h2 className="font-semibold">{point.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#475467]">{point.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm leading-6 text-[#667085]">
          {SITE.disclaimer} A forecast is not a promise of a result, and it is not an instruction to
          place a wager.
        </p>
        <Link
          href="/pricing"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-[#101828] px-5 text-sm font-semibold text-white"
        >
          See plans
        </Link>
      </article>
    </PublicFrame>
  );
}
