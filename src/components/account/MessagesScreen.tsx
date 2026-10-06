'use client';

import Link from 'next/link';
import { useDesk } from '@/components/forecast/useDesk';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { formatDateTime } from '@/lib/dates';

const channelLabel = {
  web: 'On the site',
  email: 'Email',
  sms: 'Text',
} as const;

const statusLabel = {
  available: 'Available',
  sent: 'Sent',
  queued: 'Queued',
  skipped: 'Skipped',
} as const;

export function MessagesScreen() {
  const { user, ready } = useSession();
  const desk = useDesk();

  if (!ready || !desk || !user) return <LoadingState label="Loading messages…" />;

  const rows = desk.deliveries.filter((row) => row.userId === user.id);

  return (
    <div>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Delivery messages</h1>
      <p className="mt-2 text-[15px] leading-6 text-[#667085]">
        Each published forecast is listed here for your account. Text delivery is not active yet, so
        SMS stays queued until that channel is connected.
      </p>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm leading-6 text-[#667085]">
          Nothing has been delivered to this account yet. Messages appear when a forecast is published
          and your subscription is active.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
          {rows.map((row) => {
            const forecast = desk.forecasts.find((item) => item.id === row.forecastId);
            return (
              <li key={row.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#101828]">
                    {channelLabel[row.channel]} · {statusLabel[row.status]}
                  </p>
                  <p className="mt-1 text-sm text-[#344054]">
                    {forecast ? (
                      <Link href={`/forecasts/${forecast.id}`} className="hover:underline">
                        {forecast.title}
                      </Link>
                    ) : (
                      'Forecast'
                    )}
                  </p>
                  <p className="mt-1 text-sm text-[#667085]">{row.detail}</p>
                </div>
                <p className="text-sm text-[#98a2b3]">{formatDateTime(row.at)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
