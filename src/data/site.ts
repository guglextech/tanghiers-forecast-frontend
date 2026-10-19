export const SITE = {
  name: 'Tanghiers',
  shortName: 'TG',
  project: 'TG',
  tagline: 'Daily lotto forecasts for active subscribers, on the site, by email, and by SMS.',
  description:
    'Tanghiers publishes one daily forecast and delivers it to active subscribers on the website, by email, and by text. Subscribe online with Stripe.',
  email: 'desk@tanghiers.com',
  disclaimer: 'Forecasts are not guaranteed.',
} as const;

export const publicNav = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const footerNav = {
  public: [
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
} as const;

export type PlanId = 'weekly' | 'monthly' | 'quarterly';

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  cadence: string;
  blurb: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: 'weekly',
    name: 'Weekly',
    price: 4,
    period: 'week',
    cadence: 'Billed every week',
    blurb: 'A short run of daily forecasts, renewed each week.',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 12,
    period: 'month',
    cadence: 'Billed every month',
    blurb: 'The regular desk. One forecast every publishing day.',
    featured: true,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 30,
    period: 'quarter',
    cadence: 'Billed every three months',
    blurb: 'A season of forecasts at a lower rate.',
  },
];

export function planById(id: PlanId | null | undefined) {
  return PLANS.find((plan) => plan.id === id) ?? null;
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export const homeFaqs = [
  {
    question: 'Who can see the numbers and the video?',
    answer:
      'Active subscribers. Anyone can create an account, but the current forecast, the archive, and the machine video stay closed until a plan is active.',
  },
  {
    question: 'How do I pay?',
    answer:
      'Online, with a recurring Stripe subscription. Tanghiers does not use short codes, USSD, or mobile money.',
  },
  {
    question: 'When does a forecast arrive?',
    answer:
      'When the desk publishes it. It appears on the site for active subscribers, and email and SMS delivery are recorded for each of them.',
  },
  {
    question: 'Can I save a mobile number before texts are live?',
    answer:
      'Yes. Saving a number or consent only records your choice. Nothing is sent to the number, and it is not verified, until text delivery is active.',
  },
  {
    question: 'Are the forecasts guaranteed?',
    answer: 'No. Forecasts are not guaranteed, and they are not an instruction to place a wager.',
  },
] as const;
