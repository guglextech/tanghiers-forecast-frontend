'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Clapperboard } from 'lucide-react';
import { GAMES, gameById, type Forecast, type GameId } from '@/data/forecasts';
import {
  combineDateAndTime,
  fromIsoDate,
  timeFromIso,
  toIsoDate,
  todayIsoDate,
} from '@/lib/dates';
import { saveForecast } from '@/lib/desk';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const TIMES = Array.from({ length: 36 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
});

function formatTimeLabel(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, 'h:mm a');
}

function suggestedTitle(game: GameId, date: Date) {
  return `${gameById(game).label} ${format(date, 'EEEE')} Forecast`;
}

function nearestTime(value: string) {
  if (TIMES.includes(value)) return value;
  const [hours, minutes] = value.split(':').map(Number);
  const total = hours * 60 + minutes;
  let best = TIMES[0];
  let distance = Infinity;
  for (const slot of TIMES) {
    const [slotHours, slotMinutes] = slot.split(':').map(Number);
    const next = Math.abs(slotHours * 60 + slotMinutes - total);
    if (next < distance) {
      best = slot;
      distance = next;
    }
  }
  return best;
}

export function ForecastForm({ initial }: { initial?: Forecast | null }) {
  const router = useRouter();
  const defaultDate = fromIsoDate(initial?.date ?? todayIsoDate()) ?? new Date();
  const [title, setTitle] = React.useState(
    initial?.title ?? suggestedTitle(initial?.game ?? 'pick-2', defaultDate),
  );
  const [titleTouched, setTitleTouched] = React.useState(Boolean(initial));
  const [gameId, setGameId] = React.useState<GameId>(initial?.game ?? 'pick-2');
  const [forecastDate, setForecastDate] = React.useState<Date | undefined>(defaultDate);
  const [numbers, setNumbers] = React.useState<string[]>(
    initial ? initial.numbers.map(String) : ['', ''],
  );
  const [intent, setIntent] = React.useState<'now' | 'schedule'>(
    initial?.status === 'scheduled' ? 'schedule' : 'now',
  );
  const [scheduleDate, setScheduleDate] = React.useState<Date | undefined>(
    initial?.publishAt ? new Date(initial.publishAt) : defaultDate,
  );
  const [scheduleTime, setScheduleTime] = React.useState(
    initial?.publishAt ? nearestTime(timeFromIso(initial.publishAt)) : '08:00',
  );
  const [error, setError] = React.useState('');

  const count = gameById(gameId).count;

  React.useEffect(() => {
    setNumbers((current) => {
      const next = current.slice(0, count);
      while (next.length < count) next.push('');
      return next;
    });
  }, [count]);

  React.useEffect(() => {
    if (titleTouched || !forecastDate) return;
    setTitle(suggestedTitle(gameId, forecastDate));
  }, [gameId, forecastDate, titleTouched]);

  const submit = (mode: 'draft' | 'publish' | 'schedule') => {
    setError('');
    try {
      if (!forecastDate) throw new Error('Choose the forecast date.');
      const parsed = numbers.map((value) => Number(value));
      const publishAt =
        mode === 'schedule'
          ? scheduleDate
            ? combineDateAndTime(scheduleDate, scheduleTime)
            : null
          : undefined;
      const saved = saveForecast(
        {
          id: initial?.id,
          title,
          game: gameId,
          numbers: parsed,
          date: toIsoDate(forecastDate),
          publishAt,
        },
        mode,
      );
      toast.success(
        mode === 'publish' ? 'Forecast published.' : mode === 'schedule' ? 'Forecast scheduled.' : 'Draft saved.',
      );
      router.replace(`/admin/forecasts/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the forecast.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          {initial ? 'Edit forecast' : 'New forecast'}
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-[#667085] sm:text-[15px]">
          Numbers, date, and when it should go live. Publishing makes it available on the site and
          records email and SMS for every active subscriber.
        </p>
        {initial?.status === 'published' ? (
          <Link href={`/forecasts/${initial.id}`} className="mt-3 inline-flex text-sm font-medium hover:underline">
            View on the site
          </Link>
        ) : null}
      </div>

      <form
        className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white"
        onSubmit={(event) => {
          event.preventDefault();
          submit(intent === 'schedule' ? 'schedule' : 'publish');
        }}
      >
        <section className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => {
                setTitleTouched(true);
                setTitle(event.target.value);
              }}
              placeholder="Pick 2 Tuesday Forecast"
              className="h-11 rounded-xl border-[#d0d5dd] bg-white px-3.5"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Select value={gameId} onValueChange={(value) => setGameId(value as GameId)}>
                <SelectTrigger id="game" className="h-11 rounded-xl border-[#d0d5dd] bg-white px-3.5 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GAMES.map((item) => (
                    <SelectItem key={item.id} value={item.id} hint={`${item.count} numbers`}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="forecast-date">Forecast date</Label>
              <DatePicker
                id="forecast-date"
                value={forecastDate}
                onChange={(date) => {
                  setForecastDate(date);
                  if (date && intent !== 'schedule') setScheduleDate(date);
                }}
                placeholder="Choose a date"
              />
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4 p-5 sm:p-6">
          <div>
            <Label>Numbers</Label>
            <p className="mt-1 text-sm text-[#667085]">
              {gameById(gameId).label} · each from 0 to 99
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {numbers.map((value, index) => (
              <Input
                key={index}
                inputMode="numeric"
                aria-label={`Number ${index + 1}`}
                value={value}
                onChange={(event) => {
                  const next = [...numbers];
                  next[index] = event.target.value.replace(/[^\d]/g, '').slice(0, 2);
                  setNumbers(next);
                }}
                className="size-14 rounded-full border-2 border-[#101828] bg-white text-center text-xl font-semibold tabular-nums shadow-none sm:size-16"
              />
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-4 p-5 sm:p-6">
          <div>
            <Label>Publication</Label>
            <p className="mt-1 text-sm text-[#667085]">Go live now, or pick a date and time.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f4f6f8] p-1">
            {(['now', 'schedule'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIntent(option)}
                className={cn(
                  'h-10 rounded-lg text-sm font-medium transition-colors',
                  intent === option ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]',
                )}
              >
                {option === 'now' ? 'Publish now' : 'Schedule'}
              </button>
            ))}
          </div>
          {intent === 'schedule' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Go live on</Label>
                <DatePicker
                  id="schedule-date"
                  value={scheduleDate}
                  onChange={setScheduleDate}
                  placeholder="Choose a date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <Select value={scheduleTime} onValueChange={setScheduleTime}>
                  <SelectTrigger id="schedule-time" className="h-11 rounded-xl border-[#d0d5dd] bg-white px-3.5 text-sm">
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {formatTimeLabel(slot)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          <p className="flex items-center gap-2 text-sm text-[#667085]">
            <Clapperboard className="size-4 shrink-0" />
            The machine draw is attached automatically when this is published.
          </p>
          {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
        </section>

        <Separator />

        <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:p-6">
          <Button type="submit" className="h-10">
            {intent === 'schedule' ? 'Schedule' : 'Publish now'}
          </Button>
          <Button type="button" variant="outline" className="h-10 border-[#d0d5dd]" onClick={() => submit('draft')}>
            Save draft
          </Button>
        </div>
      </form>
    </div>
  );
}
