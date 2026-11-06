export const SITE = {
  name: ' Lotto Forecasts',
  shortName: 'TG',
  project: 'TG',
  tagline: 'Daily lottery forecasts for informational and entertainment purposes.',
  description:
    'LottoForecasts publishes manually prepared lottery-related numerical forecasts for informational and entertainment purposes. Active subscribers can read them on the site, with optional email and SMS delivery.',
  email: 'support@lottoforecasts.com',
  disclaimer: 'For informational and entertainment purposes only. Results are not guaranteed.',
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
    { href: '/messaging', label: 'Messaging' },
  ],
} as const;

export type PlanId = string;

export type Plan = {
  id: PlanId;
  uuid?: string;
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
      'Active subscribers. Anyone can create an account, but the current forecast, the archive, and the draw video stay closed until a plan is active.',
  },
  {
    question: 'How do I pay?',
    answer:
      'Online, with a recurring Stripe subscription. Subscription fees pay for access to forecasting content only. LottoForecasts does not use short codes, USSD, or mobile money.',
  },
  {
    question: 'When does a forecast arrive?',
    answer:
      'When the desk publishes it. It appears on the site for active subscribers. Optional email and SMS notifications may also send up to one forecast message per day per enrolled channel.',
  },
  {
    question: 'Are SMS and email required?',
    answer:
      'No. Messaging consent is optional and is not a condition of purchase. You can enroll or change preferences in your account. Reply STOP to cancel SMS, or HELP for assistance. Email includes an unsubscribe link.',
  },
  {
    question: 'Are the forecasts guaranteed?',
    answer:
      'No. Forecasts are for informational and entertainment purposes only. Results are not guaranteed, and lottery games are games of chance.',
  },
] as const;
