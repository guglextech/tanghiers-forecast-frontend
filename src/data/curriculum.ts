export type Course = {
  code: string;
  title: string;
  term: string;
  credits: number;
  summary: string;
  topics: string[];
};

export const coreCourses: Course[] = [
  {
    code: 'MBA 501',
    title: 'Leadership and Ethics',
    term: 'Term 1',
    credits: 3,
    summary: 'Lead with integrity in African and global organizations.',
    topics: ['Ethical decision making', 'Team leadership', 'Personal leadership plan'],
  },
  {
    code: 'MBA 510',
    title: 'Managerial Economics',
    term: 'Term 1',
    credits: 3,
    summary: 'Use markets, incentives, and trade-offs to make better decisions.',
    topics: ['Demand and pricing', 'Cost structure', 'Competitive analysis'],
  },
  {
    code: 'MBA 520',
    title: 'Financial Management',
    term: 'Term 2',
    credits: 3,
    summary: 'Read statements, value projects, and fund growth responsibly.',
    topics: ['Financial statements', 'Capital budgeting', 'Working capital'],
  },
  {
    code: 'MBA 530',
    title: 'Marketing Strategy',
    term: 'Term 2',
    credits: 3,
    summary: 'Position offers for customers across Ghana and the region.',
    topics: ['Segmentation', 'Brand systems', 'Go-to-market plans'],
  },
  {
    code: 'MBA 540',
    title: 'Operations and Supply Chain',
    term: 'Term 3',
    credits: 3,
    summary: 'Design processes that deliver quality at a sustainable cost.',
    topics: ['Process design', 'Inventory', 'Service operations'],
  },
  {
    code: 'MBA 550',
    title: 'Data and Decision Making',
    term: 'Term 3',
    credits: 3,
    summary: 'Turn messy data into decisions your team can defend.',
    topics: ['Descriptive analytics', 'Forecasting', 'Decision quality'],
  },
  {
    code: 'MBA 560',
    title: 'Strategy',
    term: 'Term 4',
    credits: 3,
    summary: 'Choose where to compete and how to win over time.',
    topics: ['Industry analysis', 'Competitive advantage', 'Execution'],
  },
  {
    code: 'MBA 590',
    title: 'Capstone Consulting Project',
    term: 'Term 4',
    credits: 4,
    summary: 'Solve a live problem for an organization and present recommendations.',
    topics: ['Problem framing', 'Field research', 'Board-ready briefing'],
  },
];

export const electives: Course[] = [
  {
    code: 'MBA 612',
    title: 'Entrepreneurship and Venture Design',
    term: 'Elective',
    credits: 3,
    summary: 'Test, fund, and launch a venture with African market constraints in mind.',
    topics: ['Customer discovery', 'Business models', 'Pitch practice'],
  },
  {
    code: 'MBA 624',
    title: 'People and Organizations',
    term: 'Elective',
    credits: 3,
    summary: 'Build culture, hire well, and manage performance.',
    topics: ['Talent systems', 'Culture', 'Change leadership'],
  },
  {
    code: 'MBA 638',
    title: 'African Markets and Policy',
    term: 'Elective',
    credits: 3,
    summary: 'Read policy, trade, and institutional context that shape business here.',
    topics: ['Regional trade', 'Regulation', 'Public-private work'],
  },
];
