import type { PosterTone } from '@/components/home/ForecastPoster';

export type Teaser = {
  id: string;
  game: string;
  label: string;
  balls: number;
  tone: PosterTone;
  title: string;
  daysAgo: number;
};

export const TEASERS: Teaser[] = [
  {
    id: 'feature',
    game: 'Pick 3',
    label: 'Evening draw breakdown',
    balls: 3,
    tone: 'blue',
    title: "Tonight's Pick 3: the three numbers our model keeps landing on",
    daysAgo: 0,
  },
  {
    id: 'p4-midday',
    game: 'Pick 4',
    label: 'Midday forecast',
    balls: 4,
    tone: 'green',
    title: 'Pick 4 Midday: why this pattern showed up again this week',
    daysAgo: 0,
  },
  {
    id: 'p2-weekly',
    game: 'Pick 2',
    label: 'Weekly hot pairs',
    balls: 2,
    tone: 'sky',
    title: 'Hot pairs of the week: the Pick 2 combinations to watch',
    daysAgo: 1,
  },
  {
    id: 'p5-weekend',
    game: 'Pick 5',
    label: 'Weekend outlook',
    balls: 5,
    tone: 'slate',
    title: 'Pick 5 weekend outlook and the permutation we would play',
    daysAgo: 1,
  },
  {
    id: 'p3-recap',
    game: 'Pick 3',
    label: 'Results recap',
    balls: 3,
    tone: 'green',
    title: 'Recap: how last week\u2019s Pick 3 forecasts lined up with the draws',
    daysAgo: 2,
  },
  {
    id: 'p4-evening',
    game: 'Pick 4',
    label: 'Evening forecast',
    balls: 4,
    tone: 'blue',
    title: 'Pick 4 Evening: the full permutation walkthrough',
    daysAgo: 3,
  },
  {
    id: 'p2-cold',
    game: 'Pick 2',
    label: 'Cold numbers',
    balls: 2,
    tone: 'slate',
    title: 'Cold numbers due for a return, explained in five minutes',
    daysAgo: 3,
  },
];

export function ago(days: number) {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
