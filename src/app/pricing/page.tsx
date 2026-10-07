import type { Metadata } from 'next';
import { PublicFrame } from '@/components/chrome/Frames';
import { PlanCards } from '@/components/billing/Plans';
import { homeFaqs } from '@/data/site';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Weekly, monthly, and quarterly plans for Lotto Forecast. Billed with Stripe.',
};

export default function PricingPage() {
  return (
    <PublicFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Pricing</h1>
      <p className="mt-1 text-sm leading-6 text-[#667085]">
        An active plan opens the forecast, the archive, and the machine video. Stripe bills in USD.
      </p>
      <div className="mt-6">
        <PlanCards mode="public" />
      </div>
      <p className="mt-4 text-sm text-[#98a2b3]">
        No short code, USSD, or mobile money. Forecasts are not guaranteed.
      </p>
      <div className="mt-10 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
        {homeFaqs.map((item) => (
          <article key={item.question} className="py-4">
            <h2 className="text-[15px] font-medium">{item.question}</h2>
            <p className="mt-1.5 text-sm leading-6 text-[#667085]">{item.answer}</p>
          </article>
        ))}
      </div>
    </PublicFrame>
  );
}
