export type ForecastStatus = 'draft' | 'scheduled' | 'published';

export type GameId = 'pick-2' | 'pick-3' | 'pick-4' | 'pick-5';

export type ForecastBody = {
  banker: number[];
  twoSure: number[];
  threeDirect: number[];
  permutations: string;
};

export type Forecast = {
  id: string;
  title: string;
  game: GameId;
  numbers: number[];
  body?: ForecastBody;
  /** Calendar day the forecast belongs to, YYYY-MM-DD. */
  date: string;
  status: ForecastStatus;
  /** ISO time the forecast goes live. Null while it is a draft. */
  publishAt: string | null;
  createdAt: string;
  version?: number;
  videoUrl?: string | null;
  message?: string | null;
};

export type DeliveryChannel = 'web' | 'email' | 'sms';

export type DeliveryStatus = 'available' | 'sent' | 'queued' | 'skipped';

export type Delivery = {
  id: string;
  forecastId: string;
  userId: string;
  userEmail: string;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  detail: string;
  at: string;
};

export const GAMES: { id: GameId; label: string; count: number }[] = [
  { id: 'pick-2', label: 'Pick 2', count: 2 },
  { id: 'pick-3', label: 'Pick 3', count: 3 },
  { id: 'pick-4', label: 'Pick 4', count: 4 },
  { id: 'pick-5', label: 'Pick 5', count: 5 },
];

export function gameById(id: GameId) {
  return GAMES.find((game) => game.id === id) ?? GAMES[0];
}

export const SEED_FORECASTS: Forecast[] = [
  {
    id: 'f-20261006',
    title: 'Pick 2 Tuesday Forecast',
    game: 'pick-2',
    numbers: [6, 18],
    date: '2026-10-06',
    status: 'published',
    publishAt: '2026-10-06T08:00:00.000Z',
    createdAt: '2026-10-06T07:40:00.000Z',
  },
  {
    id: 'f-20261005',
    title: 'Pick 3 Monday Forecast',
    game: 'pick-3',
    numbers: [4, 15, 22],
    date: '2026-10-05',
    status: 'published',
    publishAt: '2026-10-05T08:00:00.000Z',
    createdAt: '2026-10-05T07:40:00.000Z',
  },
  {
    id: 'f-20261002',
    title: 'Pick 2 Friday Forecasts',
    game: 'pick-2',
    numbers: [2, 7],
    date: '2026-10-02',
    status: 'published',
    publishAt: '2026-10-02T08:00:00.000Z',
    createdAt: '2026-10-02T07:40:00.000Z',
  },
  {
    id: 'f-20261001',
    title: 'Pick 4 Thursday Forecast',
    game: 'pick-4',
    numbers: [3, 9, 14, 27],
    date: '2026-10-01',
    status: 'published',
    publishAt: '2026-10-01T08:00:00.000Z',
    createdAt: '2026-10-01T07:40:00.000Z',
  },
  {
    id: 'f-20260930',
    title: 'Pick 5 Wednesday Forecast',
    game: 'pick-5',
    numbers: [5, 8, 19, 24, 31],
    date: '2026-09-30',
    status: 'published',
    publishAt: '2026-09-30T08:00:00.000Z',
    createdAt: '2026-09-30T07:40:00.000Z',
  },
  {
    id: 'f-20261007',
    title: 'Pick 2 Wednesday Forecast',
    game: 'pick-2',
    numbers: [1, 9],
    date: '2026-10-07',
    status: 'scheduled',
    publishAt: '2026-10-07T08:00:00.000Z',
    createdAt: '2026-10-06T18:00:00.000Z',
  },
  {
    id: 'f-20261008',
    title: 'Pick 3 Thursday Forecast',
    game: 'pick-3',
    numbers: [7, 12, 28],
    date: '2026-10-08',
    status: 'draft',
    publishAt: null,
    createdAt: '2026-10-06T18:10:00.000Z',
  },
];

const DEMO_SUBSCRIBER = {
  id: 'usr_subscriber',
  email: 'subscriber@lottoforecast.test',
};

function deliveryId(forecastId: string, channel: DeliveryChannel) {
  return `${forecastId}-${DEMO_SUBSCRIBER.id}-${channel}`;
}

export function seedDeliveries(): Delivery[] {
  return SEED_FORECASTS.filter((forecast) => forecast.status === 'published').flatMap((forecast) => {
    const at = forecast.publishAt ?? `${forecast.date}T08:00:00.000Z`;
    return [
      {
        id: deliveryId(forecast.id, 'web'),
        forecastId: forecast.id,
        userId: DEMO_SUBSCRIBER.id,
        userEmail: DEMO_SUBSCRIBER.email,
        channel: 'web' as const,
        status: 'available' as const,
        detail: 'Visible on the site',
        at,
      },
      {
        id: deliveryId(forecast.id, 'email'),
        forecastId: forecast.id,
        userId: DEMO_SUBSCRIBER.id,
        userEmail: DEMO_SUBSCRIBER.email,
        channel: 'email' as const,
        status: 'sent' as const,
        detail: 'Sent to the subscriber inbox',
        at,
      },
      {
        id: deliveryId(forecast.id, 'sms'),
        forecastId: forecast.id,
        userId: DEMO_SUBSCRIBER.id,
        userEmail: DEMO_SUBSCRIBER.email,
        channel: 'sms' as const,
        status: 'queued' as const,
        detail: 'Recorded. Text delivery is not active yet.',
        at,
      },
    ];
  });
}

export function latestPublished(forecasts: Forecast[]) {
  return (
    forecasts
      .filter((forecast) => forecast.status === 'published')
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0] ?? null
  );
}

export function publishedForecasts(forecasts: Forecast[]) {
  return forecasts
    .filter((forecast) => forecast.status === 'published')
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
