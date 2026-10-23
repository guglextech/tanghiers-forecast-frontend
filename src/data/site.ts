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

export type PlanId = string;

export type Plan = {
  id: PlanId;
  name: string;
  price: number | null;
  currency?: string;
  period: string;
  cadence: string;
  blurb: string;
  featured?: boolean;
  channels?: string[];
  kind?: string;
};

export function planById(id: PlanId | null | undefined) {
  if (!id) return null;
  const name = id.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  return { id, name, price: null, period: '', cadence: '', blurb: '' };
}

export function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPlanPrice(plan: Pick<Plan, 'price' | 'currency' | 'period'>) {
  if (typeof plan.price !== 'number') return null;
  const amount = formatMoney(plan.price, plan.currency);
  return plan.period ? `${amount}/${plan.period}` : amount;
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
