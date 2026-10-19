import type { Metadata } from 'next';
import { PublicFrame } from '@/components/chrome/Frames';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Terms',
  description: `Terms of use for ${SITE.name}.`,
};

const sections = [
  {
    title: 'The service',
    body: 'Tanghiers publishes daily forecasts and machine video for people with an active subscription. Access on the site, by email, and by SMS is part of that subscription.',
  },
  {
    title: 'No guarantee',
    body: 'Forecasts are not guaranteed. They are not a promise of a result and they are not an instruction to place a wager. You are responsible for any decision you make after reading one.',
  },
  {
    title: 'Subscriptions',
    body: 'Plans renew through Stripe until you cancel. Canceling closes forecast access. Taxes, where they apply, are added by the payment provider.',
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
        These terms cover use of {SITE.name}, a {SITE.project} product.
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
        Contact:{' '}
        <a className="font-medium text-[#101828] hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </p>
    </PublicFrame>
  );
}
