const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Parse YYYY-MM-DD without UTC timezone shift — safe for SSR and client hydration. */
export function formatDisplayDate(date: string): string {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(date);
  if (!match) return date;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return date;

  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
