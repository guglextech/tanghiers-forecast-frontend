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
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#475467]">
          An active plan opens the current forecast, the archive, and the machine video. Billing is a
          recurring Stripe subscription in USD.
        </p>
        <div className="mt-10">
          <PlanCards mode="public" />
        </div>
        <p className="mt-6 text-sm text-[#667085]">
          Lotto Forecast does not take short-code, USSD, or mobile-money payments. Forecasts are not
          guaranteed.
        </p>
        <div className="mt-14 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
          {homeFaqs.map((item) => (
            <article key={item.question} className="py-5">
              <h2 className="font-medium">{item.question}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475467]">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </PublicFrame>
  );
}
