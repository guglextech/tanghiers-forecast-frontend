import type { Metadata } from 'next';
import { AdaptiveFrame } from '@/components/chrome/Frames';
import { PlanCards } from '@/components/billing/Plans';
import { SITE } from '@/data/site';
import { getCatalogPlans } from '@/lib/plans';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Subscribe to Tanghiers. Stripe bills in USD.',
};

export const dynamic = 'force-dynamic';

const faqs = [
  {
    title: 'What a plan unlocks',
    body: 'Access to the daily forecast, archive, and draw video. Optional email and SMS notifications may also deliver up to one forecast message per day per enrolled channel if you opt in.',
  },
  {
    title: 'Cancel anytime',
    body: 'Manage or cancel from Subscription. Access stays through the end of the current period. Messaging consent is optional and separate from your plan.',
  },
];

export default async function PricingPage() {
  let plans: Awaited<ReturnType<typeof getCatalogPlans>> = [];
  try {
    plans = await getCatalogPlans();
  } catch {
    plans = [];
  }

  return (
    <AdaptiveFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Pricing</h1>
      <p className="mt-1 text-sm text-[#98a2b3]">
        One plan opens the forecast. Billed in USD.
      </p>

      <div className="mt-8">
        <PlanCards mode="public" plans={plans} />
      </div>

      <p className="mt-8 text-sm text-[#98a2b3]">
        Every plan includes the daily forecast, draw video, and archive. Email and SMS are optional
        and can be managed in your account.
      </p>

      <div className="mt-10 space-y-6">
        {faqs.map((item) => (
          <section key={item.title}>
            <h2 className="text-sm font-semibold text-[#101828]">{item.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#98a2b3]">{item.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-[#98a2b3]">{SITE.disclaimer}</p>
    </AdaptiveFrame>
  );
}
