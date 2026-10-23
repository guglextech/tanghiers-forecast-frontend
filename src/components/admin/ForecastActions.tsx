'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import type { Forecast } from '@/data/forecasts';
import {
  archiveForecast,
  deleteDraft,
  publishForecastNow,
  unscheduleForecast,
} from '@/lib/desk';
import { ConfirmDrawer } from '@/components/admin/ConfirmDrawer';
import { formatLongDate } from '@/lib/dates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ConfirmAction = 'publish' | 'archive' | 'delete';

const confirmCopy: Record<ConfirmAction, { title: string; description: string; confirm: string }> = {
  publish: {
    title: 'Publish this forecast?',
    description: 'It will go live for subscribers, and email and SMS delivery will be recorded.',
    confirm: 'Publish now',
  },
  archive: {
    title: 'Archive this forecast?',
    description: 'It will leave the live feed. You can still find it in the archive.',
    confirm: 'Archive',
  },
  delete: {
    title: 'Delete this draft?',
    description: 'This cannot be undone.',
    confirm: 'Delete draft',
  },
};

export function ForecastActions({
  forecast,
  onDeleted,
}: {
  forecast: Forecast;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [confirm, setConfirm] = React.useState<ConfirmAction | null>(null);

  const run = async (action: 'publish' | 'unschedule' | 'archive' | 'delete') => {
    setBusy(true);
    try {
      if (action === 'publish') {
        await publishForecastNow(forecast.id);
        toast.success('Forecast published.');
      } else if (action === 'unschedule') {
        await unscheduleForecast(forecast.id);
        toast.success('Forecast unscheduled.');
      } else if (action === 'archive') {
        await archiveForecast(forecast.id);
        toast.success('Forecast archived.');
      } else {
        await deleteDraft(forecast.id);
        toast.success('Draft deleted.');
        onDeleted?.();
      }
      setConfirm(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update this forecast.');
    } finally {
      setBusy(false);
    }
  };

  const copy = confirm ? confirmCopy[confirm] : null;
  const canPublish = forecast.status === 'draft' || forecast.status === 'scheduled';
  const canUnschedule = forecast.status === 'scheduled';
  const canArchive = forecast.status === 'published' || forecast.status === 'scheduled';
  const canDelete = forecast.status === 'draft';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={busy}
            aria-label={`Actions for ${forecast.title}`}
            className="grid size-8 place-items-center rounded-full text-[#667085] transition-colors hover:bg-[#f2f4f7] hover:text-[#101828] disabled:opacity-50"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-xl">
          <DropdownMenuItem onSelect={() => router.push(`/admin/forecasts/${forecast.id}`)}>
            Edit
          </DropdownMenuItem>
          {forecast.status === 'published' ? (
            <DropdownMenuItem onSelect={() => router.push(`/forecasts/${forecast.id}`)}>
              View on site
            </DropdownMenuItem>
          ) : null}
          {canPublish ? (
            <DropdownMenuItem onSelect={() => setConfirm('publish')}>
              Publish now
            </DropdownMenuItem>
          ) : null}
          {canUnschedule ? (
            <DropdownMenuItem
              disabled={busy}
              onSelect={() => {
                void run('unschedule');
              }}
            >
              Unschedule
            </DropdownMenuItem>
          ) : null}
          {canArchive ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setConfirm('archive')}>
                Archive
              </DropdownMenuItem>
            </>
          ) : null}
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirm('delete')}>
                Delete draft
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDrawer
        open={Boolean(confirm)}
        title={copy?.title ?? ''}
        description={copy?.description ?? ''}
        subject={{ title: forecast.title, detail: formatLongDate(forecast.date) }}
        confirmLabel={copy?.confirm ?? 'Confirm'}
        busy={busy}
        destructive={confirm === 'delete'}
        onClose={() => {
          if (!busy) setConfirm(null);
        }}
        onConfirm={() => {
          if (confirm) void run(confirm);
        }}
      />
    </>
  );
}
