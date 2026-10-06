'use client';

import Link from 'next/link';
import { latestPublished, publishedForecasts } from '@/data/forecasts';
import { formatLongDate } from '@/lib/dates';
import { hasForecastAccess } from '@/lib/session';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { ForecastArticle, NumberPills } from '@/components/forecast/ForecastArticle';
import { useDesk } from '@/components/forecast/useDesk';
import { gameById } from '@/data/forecasts';
import { planById } from '@/data/site';

export function FeedScreen() {
  const { user, ready } = useSession();
  const desk = useDesk();

  if (!ready || !desk || !user) return <LoadingState label="Loading the forecast…" />;

  const latest = latestPublished(desk.forecasts);
  const locked = !hasForecastAccess(user);
  const plan = planById(user.planId);

  return (
    <div>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Daily forecast</h1>
      <p className="mt-2 text-[15px] leading-6 text-[#667085]">
        Numbers and machine video, posted by the creator.
      </p>

      {locked ? (
        <div className="mt-8 rounded-2xl border border-[#e6e8ee] px-5 py-5">
          <p className="font-medium text-[#101828]">An active plan opens today’s forecast.</p>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            The numbers, the machine video, and the archive are for active subscribers.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex h-10 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white"
          >
            See plans
          </Link>
        </div>
      ) : plan ? (
        <p className="mt-6 text-sm text-[#667085]">Included with your {plan.name} plan.</p>
      ) : null}

      {latest ? (
        <div className={locked ? 'mt-8' : 'mt-8'}>
          <ForecastArticle forecast={latest} locked={locked} />
        </div>
      ) : (
        <p className="mt-8 text-sm text-[#667085]">No forecast has been published yet.</p>
      )}

      <p className="mt-8 text-sm text-[#667085]">
        <Link href="/history" className="font-medium text-[#101828] hover:underline">
          Forecast history
        </Link>
      </p>
    </div>
  );
}

export function HistoryScreen() {
  const { user, ready } = useSession();
  const desk = useDesk();

  if (!ready || !desk || !user) return <LoadingState label="Loading history…" />;

  const locked = !hasForecastAccess(user);
  const items = publishedForecasts(desk.forecasts);

  return (
    <div>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Forecast history</h1>
      <p className="mt-2 text-[15px] leading-6 text-[#667085]">
        Current and past forecasts for active subscribers.
      </p>
      {locked ? (
        <p className="mt-6 text-sm leading-6 text-[#667085]">
          Dates and titles are listed here. Numbers and video open with an{' '}
          <Link href="/pricing" className="font-medium text-[#101828] hover:underline">
            active plan
          </Link>
          .
        </p>
      ) : null}
      <ul className="mt-8 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
        {items.map((forecast) => {
          const game = gameById(forecast.game);
          return (
            <li key={forecast.id}>
              <Link href={`/forecasts/${forecast.id}`} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="block text-sm text-[#667085]">{formatLongDate(forecast.date)}</span>
                  <span className="mt-1 block font-medium text-[#101828]">{forecast.title}</span>
                  <span className="mt-1 block text-sm text-[#98a2b3]">{game.label}</span>
                </span>
                {locked ? (
                  <span className="text-sm text-[#98a2b3]">Locked</span>
                ) : (
                  <NumberPills numbers={forecast.numbers} size="sm" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ForecastScreen({ id }: { id: string }) {
  const { user, ready } = useSession();
  const desk = useDesk();

  if (!ready || !desk || !user) return <LoadingState label="Loading the forecast…" />;

  const forecast = desk.forecasts.find((item) => item.id === id);
  if (!forecast || forecast.status !== 'published') {
    return (
      <div>
        <h1 className="text-[1.75rem] font-semibold tracking-tight">Forecast</h1>
        <p className="mt-3 text-sm leading-6 text-[#667085]">This forecast is not published.</p>
        <Link href="/history" className="mt-6 inline-flex text-sm font-medium text-[#101828] hover:underline">
          Back to history
        </Link>
      </div>
    );
  }

  const locked = !hasForecastAccess(user);

  return (
    <div>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Daily forecast</h1>
      <p className="mt-2 text-[15px] leading-6 text-[#667085]">
        Numbers and machine video, posted by the creator.
      </p>
      <div className="mt-8">
        <ForecastArticle forecast={forecast} locked={locked} />
      </div>
      <p className="mt-8 text-sm">
        <Link href="/history" className="font-medium text-[#101828] hover:underline">
          All forecasts
        </Link>
      </p>
    </div>
  );
}
