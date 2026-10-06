export type Resource = {
  slug: string;
  title: string;
  category: 'Cases' | 'Frameworks' | 'Templates' | 'Readings' | 'Career';
  summary: string;
  href: string;
};

export const resources: Resource[] = [
  {
    slug: 'case-method-guide',
    title: 'How to prepare an MBA case',
    category: 'Cases',
    summary: 'A one-page prep ritual: facts, decision, alternatives, and recommendation.',
    href: '/resources',
  },
  {
    slug: 'porter-five-forces',
    title: 'Five Forces worksheet',
    category: 'Frameworks',
    summary: 'Score rivalry, buyers, suppliers, substitutes, and new entrants.',
    href: '/resources',
  },
  {
    slug: 'business-model-canvas',
    title: 'Business model canvas',
    category: 'Frameworks',
    summary: 'Map value, customers, channels, costs, and revenue on one page.',
    href: '/resources',
  },
  {
    slug: 'financial-model-starter',
    title: 'Simple financial model starter',
    category: 'Templates',
    summary: 'Revenue, costs, cash, and a 12-month forecast you can defend in class.',
    href: '/resources',
  },
  {
    slug: 'strategy-memo',
    title: 'Strategy memo template',
    category: 'Templates',
    summary: 'Situation, complication, question, answer — then the supporting analysis.',
    href: '/resources',
  },
  {
    slug: 'african-business-readings',
    title: 'African business reading list',
    category: 'Readings',
    summary: 'Core articles and books on markets, institutions, and leadership on the continent.',
    href: '/resources',
  },
  {
    slug: 'cv-one-page',
    title: 'One-page MBA CV guide',
    category: 'Career',
    summary: 'What to keep, what to cut, and how to quantify impact.',
    href: '/career',
  },
  {
    slug: 'case-interview-drills',
    title: 'Case interview drills',
    category: 'Career',
    summary: 'Market sizing, profitability, and a 20-minute practice loop.',
    href: '/career',
  },
];

export const resourceCategories = [
  'Cases',
  'Frameworks',
  'Templates',
  'Readings',
  'Career',
] as const;
