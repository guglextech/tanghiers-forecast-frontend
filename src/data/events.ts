export type MbaEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  type: 'Lecture' | 'Workshop' | 'Career' | 'Community';
  summary: string;
};

export const upcomingEvents: MbaEvent[] = [
  {
    id: 'evt-guest-ops',
    title: 'Guest lecture: scaling operations in West Africa',
    date: '2026-10-08',
    time: '18:00',
    place: 'Berekuso campus / hybrid',
    type: 'Lecture',
    summary: 'A COO walkthrough of distribution, quality, and people systems.',
  },
  {
    id: 'evt-finance-lab',
    title: 'Workshop: building a board-ready financial model',
    date: '2026-10-15',
    time: '17:30',
    place: 'MBA studio',
    type: 'Workshop',
    summary: 'Bring a live case. Leave with a forecast and a one-page assumptions list.',
  },
  {
    id: 'evt-career-night',
    title: 'Career night with alumni hiring managers',
    date: '2026-10-22',
    time: '18:30',
    place: 'Accra hub',
    type: 'Career',
    summary: 'Short briefings, then 15-minute conversations with alumni in strategy, finance, and product.',
  },
  {
    id: 'evt-cohort-mixer',
    title: 'Cohort mixer and mentoring circles',
    date: '2026-11-05',
    time: '17:00',
    place: 'Campus terrace',
    type: 'Community',
    summary: 'Meet across years. Pair with a mentor for the capstone season.',
  },
];
