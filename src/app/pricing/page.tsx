import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { PublicFrame } from '@/components/chrome/Frames';
import { PlanCards } from '@/components/billing/Plans';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Weekly, monthly, and quarterly plans for Tanghiers. Billed with Stripe.',
};

const included = [
  'Daily forecast numbers',
  'Draw video on the feed',
  'Archive of published days',
  'Email delivery with each publish',
];

const faqs = [
  {
    question: 'What does a plan unlock?',
    answer:
      'Active subscribers see the numbers, the archive, and the draw video. The same forecast is also recorded for email and SMS.',
  },
  {
    question: 'How do I pay?',
    answer:
      'Online, with a recurring Stripe subscription in USD. Tanghiers does not use short codes, USSD, or mobile money.',
  },
  {
    question: 'Can I cancel?',
    answer:
      'Yes. Cancel from Subscription. Access stays through the end of the current period.',
  },
  {
    question: 'Are the forecasts guaranteed?',
    answer: SITE.disclaimer + ' They are not an instruction to place a wager.',
  },
];

export default function PricingPage() {
  return (
    <PublicFrame>
      <header>
        <p className="text-[11px] font-medium tracking-[0.16em] text-[#98a2b3] uppercase">Plans</p>
        <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight">Simple pricing</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
          One active plan opens the forecast and the draw. Stripe bills in USD.
        </p>
      </header>

      <div className="mt-8">
        <PlanCards mode="public" />
      </div>

      <section className="mt-10">
        <h2 className="text-[15px] font-semibold text-[#101828]">Included</h2>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-[#344054]">
              <Check className="mt-0.5 size-4 shrink-0 text-[#101828]" strokeWidth={2} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <Accordion type="single" collapsible className="mt-12 border-t border-[#eef0f3]">
        {faqs.map((item) => (
          <AccordionItem key={item.question} value={item.question} className="border-[#eef0f3]">
            <AccordionTrigger className="py-4 text-[15px] font-medium text-[#101828] hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-[#667085]">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="mt-8 text-sm text-[#98a2b3]">{SITE.disclaimer}</p>
    </PublicFrame>
  );
}
