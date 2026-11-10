'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Clapperboard } from '@/components/ui/icons';
import { type Forecast } from '@/data/forecasts';
import { ForecastActions } from '@/components/admin/ForecastActions';
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

export function ForecastForm({ initial }: { initial?: Forecast | null }) {
  const router = useRouter();
  const defaultDate = fromIsoDate(initial?.date ?? todayIsoDate()) ?? new Date();
  const [title, setTitle] = React.useState(initial?.title ?? suggestedTitle(defaultDate));
  const [titleTouched, setTitleTouched] = React.useState(Boolean(initial));
  const [forecastDate, setForecastDate] = React.useState<Date | undefined>(defaultDate);
  const [permutations, setPermutations] = React.useState(initial?.body?.permutations ?? '');
  const [message, setMessage] = React.useState(initial?.message ?? '');
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
  const [saving, setSaving] = React.useState<'draft' | 'publish' | 'schedule' | null>(null);

  React.useEffect(() => {
    if (titleTouched || !forecastDate) return;
    setTitle(suggestedTitle(forecastDate));
  }, [forecastDate, titleTouched]);

  const submit = async (mode: 'draft' | 'publish' | 'schedule') => {
    setError('');
    setSaving(mode);
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
      setSaving(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">
            {initial ? 'Edit forecast' : 'New forecast'}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[#667085]">
            Permutation and a short message for the draw date. Publishing makes it available on the
            site and queues email and SMS for subscribers who opted in.
          </p>
          {initial?.status === 'published' ? (
            <Link href={`/forecasts/${initial.id}`} className="mt-3 inline-flex text-sm font-medium hover:underline">
              View on the site
            </Link>
          ) : null}
        </div>
        {initial ? (
          <ForecastActions forecast={initial} onDeleted={() => router.push('/admin/forecasts')} />
        ) : null}
      </div>

      <form
        className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
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

        <section className="grid gap-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="permutations">Permutation</Label>
            <Textarea
              id="permutations"
              value={permutations}
              onChange={(event) => setPermutations(event.target.value)}
              placeholder="7-12-45"
              className="min-h-28 font-mono tracking-wide md:text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Play responsibly."
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-5 p-5 sm:p-6">
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
          <div className="grid grid-cols-2 gap-1 rounded-[var(--radius)] bg-muted p-1">
            {(['now', 'schedule'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIntent(option)}
                className={cn(
                  'h-8 rounded-[var(--radius)] text-sm font-medium transition-colors',
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
          {initial?.status === 'archived' ? (
            <p className="text-sm text-[#667085]">This forecast is archived.</p>
          ) : (
            <>
              <Button
                type="submit"
                loading={saving === 'publish' || saving === 'schedule'}
                disabled={Boolean(saving)}
              >
                {saving === 'publish' || saving === 'schedule'
                  ? 'Processing'
                  : intent === 'schedule'
                    ? 'Schedule'
                    : 'Publish now'}
              </Button>
              <Button
                type="button"
                variant="outline"
                loading={saving === 'draft'}
                disabled={Boolean(saving)}
                onClick={() => void submit('draft')}
              >
                {saving === 'draft' ? 'Saving' : 'Save draft'}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
