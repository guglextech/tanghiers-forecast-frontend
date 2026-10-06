'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { latestPublished, publishedForecasts, gameById, type Forecast } from '@/data/forecasts';
import { formatMonthYear, formatWeekdayDay } from '@/lib/dates';
import { hasForecastAccess } from '@/lib/session';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { ForecastArticle, NumberPills } from '@/components/forecast/ForecastArticle';
import { useDesk } from '@/components/forecast/useDesk';
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
  const groups = groupByMonth(items);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-[#667085]">
            {items.length === 0
              ? 'No published forecasts yet.'
              : `${items.length} published`}
          </p>
        </div>
        {locked ? (
          <Link href="/pricing" className="text-sm font-medium text-[#101828] hover:underline">
            Unlock
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? null : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#e6e8ee]">
          {groups.map((group) => (
            <section key={group.month} className="border-t border-[#eef0f3] first:border-t-0">
              <h2 className="bg-[#f7f8fa] px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-[#98a2b3] uppercase">
                {group.label}
              </h2>
              <ul>
                {group.items.map((forecast) => {
                  const game = gameById(forecast.game);
                  return (
                    <li key={forecast.id} className="border-t border-[#eef0f3] first:border-t-0">
                      <Link
                        href={`/forecasts/${forecast.id}`}
                        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f7f8fa] sm:gap-4"
                      >
                        <span className="w-[4.5rem] shrink-0 whitespace-nowrap text-sm tabular-nums text-[#667085]">
                          {formatWeekdayDay(forecast.date)}
                        </span>
                        <span className="w-[3.75rem] shrink-0 text-sm text-[#98a2b3]">{game.label}</span>
                        <span className="min-w-0 flex-1">
                          {locked ? (
                            <span className="flex gap-1.5" aria-label="Numbers locked">
                              {Array.from({ length: game.count }).map((_, index) => (
                                <span
                                  key={index}
                                  className="grid size-7 place-items-center rounded-full border border-[#d0d5dd] text-[11px] text-[#d0d5dd]"
                                >
                                  •
                                </span>
                              ))}
                            </span>
                          ) : (
                            <NumberPills numbers={forecast.numbers} size="xs" />
                          )}
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-[#d0d5dd] transition-colors group-hover:text-[#667085]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByMonth(forecasts: Forecast[]) {
  const groups: { month: string; label: string; items: Forecast[] }[] = [];
  for (const forecast of forecasts) {
    const month = forecast.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last?.month === month) {
      last.items.push(forecast);
    } else {
      groups.push({ month, label: formatMonthYear(forecast.date), items: [forecast] });
    }
  }
  return groups;
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
