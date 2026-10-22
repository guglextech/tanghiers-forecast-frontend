'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Clapperboard } from 'lucide-react';
import { type Forecast } from '@/data/forecasts';
import {
  combineDateAndTime,
  fromIsoDate,
  timeFromIso,
  toIsoDate,
  todayIsoDate,
} from '@/lib/dates';
import { permutationsFrom } from '@/lib/api/mappers';
import { saveForecast } from '@/lib/desk';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const SAMPLE_VIDEO = 'https://www.youtube.com/watch?v=GymyHmEjBxI';

function formatTimeLabel(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, 'h:mm a');
}

function suggestedTitle(date: Date) {
  return `${format(date, 'EEEE')} picks`;
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

function padStrings(values: number[] | undefined, count: number) {
  const next = (values ?? []).map(String);
  while (next.length < count) next.push('');
  return next.slice(0, count);
}

function parseDigits(values: string[]) {
  return values.map((value) => Number(value));
}

function NumberGroup({
  id,
  label,
  hint,
  values,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={`${id}-0`}>{label}</Label>
        <span className="text-xs text-[#98a2b3]">{hint}</span>
      </div>
      <div className="flex gap-2">
        {values.map((value, index) => (
          <Input
            key={index}
            id={`${id}-${index}`}
            inputMode="numeric"
            aria-label={`${label} ${index + 1}`}
            placeholder="00"
            value={value}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value.replace(/[^\d]/g, '').slice(0, 2);
              onChange(next);
            }}
            className="w-12 px-0 text-center tabular-nums sm:w-14"
          />
        ))}
      </div>
    </div>
  );
}

export function ForecastForm({ initial }: { initial?: Forecast | null }) {
  const router = useRouter();
  const defaultDate = fromIsoDate(initial?.date ?? todayIsoDate()) ?? new Date();
  const [title, setTitle] = React.useState(initial?.title ?? suggestedTitle(defaultDate));
  const [titleTouched, setTitleTouched] = React.useState(Boolean(initial));
  const [forecastDate, setForecastDate] = React.useState<Date | undefined>(defaultDate);
  const [banker, setBanker] = React.useState(padStrings(initial?.body?.banker ?? initial?.numbers.slice(0, 1), 1));
  const [twoSure, setTwoSure] = React.useState(
    padStrings(initial?.body?.twoSure ?? initial?.numbers.slice(1, 3), 2),
  );
  const [threeDirect, setThreeDirect] = React.useState(
    padStrings(initial?.body?.threeDirect ?? initial?.numbers.slice(3, 6), 3),
  );
  const [permutations, setPermutations] = React.useState(initial?.body?.permutations ?? '');
  const [permutationsTouched, setPermutationsTouched] = React.useState(Boolean(initial?.body?.permutations));
  const [message, setMessage] = React.useState(initial?.message ?? 'Play responsibly.');
  const [videoUrl, setVideoUrl] = React.useState(initial?.videoUrl ?? SAMPLE_VIDEO);
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

  React.useEffect(() => {
    if (titleTouched || !forecastDate) return;
    setTitle(suggestedTitle(forecastDate));
  }, [forecastDate, titleTouched]);

  React.useEffect(() => {
    if (permutationsTouched) return;
    const bankerNums = parseDigits(banker).filter((_, index) => banker[index] !== '');
    const twoSureNums = parseDigits(twoSure).filter((_, index) => twoSure[index] !== '');
    setPermutations(permutationsFrom(bankerNums, twoSureNums));
  }, [banker, twoSure, permutationsTouched]);

  const submit = async (mode: 'draft' | 'publish' | 'schedule') => {
    setError('');
    try {
      if (!forecastDate) throw new Error('Choose the forecast date.');
      const publishAt =
        mode === 'schedule'
          ? scheduleDate
            ? combineDateAndTime(scheduleDate, scheduleTime)
            : null
          : undefined;
      const saved = await saveForecast(
        {
          id: initial?.id,
          title,
          date: toIsoDate(forecastDate),
          banker: parseDigits(banker),
          twoSure: parseDigits(twoSure),
          threeDirect: parseDigits(threeDirect),
          permutations,
          message,
          videoUrl,
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
          Banker, two sure, and three direct for the draw date. Publishing makes it available on the
          site and records email and SMS for every active subscriber.
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
          void submit(intent === 'schedule' ? 'schedule' : 'publish');
        }}
      >
        <section className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => {
                setTitleTouched(true);
                setTitle(event.target.value);
              }}
              placeholder="Thursday picks"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="forecast-date">Draw date</Label>
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
        </section>

        <Separator />

        <section className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <NumberGroup id="banker" label="Banker" hint="1 · 0–99" values={banker} onChange={setBanker} />
          <NumberGroup id="two-sure" label="Two sure" hint="2 · 0–99" values={twoSure} onChange={setTwoSure} />
          <div className="sm:col-span-2">
            <NumberGroup
              id="three-direct"
              label="Three direct"
              hint="3 · 0–99"
              values={threeDirect}
              onChange={setThreeDirect}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="permutations">Permutations</Label>
            <Input
              id="permutations"
              value={permutations}
              onChange={(event) => {
                setPermutationsTouched(true);
                setPermutations(event.target.value);
              }}
              placeholder="7-12-45"
              className="font-mono tracking-wide"
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Play responsibly."
              className="min-h-20 md:text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://youtu.be/…"
            />
            <p className="flex items-center gap-2 text-sm text-[#667085]">
              <Clapperboard className="size-4 shrink-0" />
              YouTube link shown with the forecast on the feed.
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-4 p-5 sm:p-6">
          <div>
            <Label>Publication</Label>
            <p className="mt-1 text-sm text-[#667085]">Go live now, or pick a date and time.</p>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
            {(['now', 'schedule'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIntent(option)}
                className={cn(
                  'h-8 rounded-md text-sm font-medium transition-colors',
                  intent === option ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
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
                  <SelectTrigger id="schedule-time">
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
          {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
        </section>

        <Separator />

        <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:p-6">
          <Button type="submit">
            {intent === 'schedule' ? 'Schedule' : 'Publish now'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void submit('draft')}>
            Save draft
          </Button>
        </div>
      </form>
    </div>
  );
}
