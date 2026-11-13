'use client';

import * as React from 'react';
import { Download, Loader2, Mail, MoreHorizontal, Smartphone } from '@/components/ui/icons';
import { toast } from 'sonner';
import { admin, asList } from '@/lib/api/resources';
import { mapWaitlistEntry, type WaitlistEntry } from '@/lib/api/mappers';
import type { ApiWaitlistEntry } from '@/lib/api/types';
import { formatDeskDate, formatDeskStamp } from '@/lib/dates';
import { PAGE_SIZE } from '@/lib/pagination';
import { LoadingState } from '@/components/app/LoadingState';
import {
  DeskScroll,
  Directory,
  EmptyRow,
  Mark,
  PageLead,
  Pill,
  SearchField,
  Th,
  td,
  stickyEnd,
  stickyStart,
  toneFor,
} from '@/components/admin/desk-ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const listTh = 'py-3 text-xs font-medium tracking-normal normal-case text-[#667085]';

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function WaitlistCell({ entry }: { entry: WaitlistEntry }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Mark name={entry.name} round />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#101828]">{entry.name}</p>
        <p className="mt-0.5 truncate text-xs text-[#667085]">{entry.email || 'No email'}</p>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: typeof Mail;
  label: string;
  value: React.ReactNode;
  tone?: 'blue' | 'green' | 'violet' | 'slate';
}) {
  const tones = {
    blue: 'bg-[#eef4ff] text-[#0B3A82]',
    green: 'bg-[#ecfdf3] text-[#067647]',
    violet: 'bg-[#f4f3ff] text-[#5925dc]',
    slate: 'bg-[#f2f4f7] text-[#475467]',
  } as const;
  return (
    <div className="flex min-w-0 items-start gap-3 py-2">
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', tones[tone])}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#98a2b3]">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-[#101828]">{value}</div>
      </div>
    </div>
  );
}

function WaitlistDetailSheet({
  entryId,
  open,
  onOpenChange,
}: {
  entryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [entry, setEntry] = React.useState<WaitlistEntry | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open || !entryId) return;
    let cancelled = false;
    setEntry(null);
    setError('');
    admin
      .waitlistEntry(entryId)
      .then((row) => {
        if (!cancelled) setEntry(mapWaitlistEntry(row));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this entry.');
      });
    return () => {
      cancelled = true;
    };
  }, [entryId, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 border-l-0 p-0 sm:max-w-lg">
        {!entry ? (
          <div className="grid flex-1 place-items-center p-6">
            <SheetTitle className="sr-only">Waitlist entry</SheetTitle>
            <SheetDescription className="sr-only">Marketing list details</SheetDescription>
            {error ? <p className="text-sm text-[#b42318]">{error}</p> : <Loader2 className="size-5 animate-spin text-[#98a2b3]" />}
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-[#eef0f3] px-6 py-5 pr-12">
              <div className="flex items-center gap-3">
                <Mark name={entry.name} round />
                <div className="min-w-0">
                  <SheetTitle className="truncate text-lg font-semibold tracking-tight text-[#101828]">
                    {entry.name}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 truncate">{entry.email || 'No email'}</SheetDescription>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Pill tone={toneFor(entry.status)}>{titleCase(entry.status)}</Pill>
                {entry.source ? (
                  <span className="inline-flex rounded-full bg-[#eff8ff] px-2.5 py-1 text-xs font-semibold text-[#175cd3]">
                    {titleCase(entry.source)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <section>
                <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-[#667085] uppercase">Contact</h3>
                <DetailRow icon={Mail} label="Email" value={entry.email || '—'} tone="blue" />
                <DetailRow icon={Smartphone} label="Phone" value={entry.phone || 'Not added'} tone="green" />
              </section>

              <section>
                <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-[#667085] uppercase">Details</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-[#98a2b3]">Country</dt>
                    <dd className="mt-0.5 text-sm font-medium text-[#101828]">{entry.countryCode || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#98a2b3]">Timezone</dt>
                    <dd className="mt-0.5 text-sm font-medium text-[#101828]">{entry.timezone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#98a2b3]">Joined</dt>
                    <dd className="mt-0.5 text-sm font-medium text-[#101828]">
                      {entry.createdAt ? formatDeskStamp(entry.createdAt) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#98a2b3]">Updated</dt>
                    <dd className="mt-0.5 text-sm font-medium text-[#101828]">
                      {entry.updatedAt ? formatDeskStamp(entry.updatedAt) : '—'}
                    </dd>
                  </div>
                </dl>
              </section>

              {entry.notes ? (
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-[#667085] uppercase">Notes</h3>
                  <p className="border-l-2 border-[#0B3A82] pl-3 text-sm leading-6 whitespace-pre-line text-[#344054]">
                    {entry.notes}
                  </p>
                </section>
              ) : null}
            </div>

            <div className="flex justify-end border-t border-[#eef0f3] px-6 py-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 items-center rounded-lg border border-[#d0d5dd] bg-white px-3.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function WaitlistActions({ entry, onView }: { entry: WaitlistEntry; onView: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${entry.name}`}
          className="grid size-8 place-items-center rounded-full text-[#667085] hover:bg-[#f2f4f7] hover:text-[#101828]"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        <DropdownMenuItem onSelect={onView}>View</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MarketingListScreen() {
  const [entries, setEntries] = React.useState<WaitlistEntry[]>([]);
  const [ready, setReady] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [exporting, setExporting] = React.useState(false);
  const [viewId, setViewId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const payload = await admin.waitlist();
    const rows = asList<ApiWaitlistEntry>(payload)
      .map(mapWaitlistEntry)
      .filter((entry) => entry.id)
      .sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')));
    setEntries(rows);
    setReady(true);
  }, []);

  React.useEffect(() => {
    void load().catch(() => {
      setEntries([]);
      setReady(true);
    });
  }, [load]);

  const filtered = entries.filter((entry) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${entry.name} ${entry.email} ${entry.phone} ${entry.source}`.toLowerCase().includes(needle);
  });

  React.useEffect(() => {
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > pages - 1) setPage(pages - 1);
  }, [filtered.length, page]);

  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await admin.exportWaitlist();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'waitlist.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Waitlist export downloading.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not export the waitlist.');
    } finally {
      setExporting(false);
    }
  };

  if (!ready) return <LoadingState label="Loading marketing list…" />;

  return (
    <div className="space-y-5">
      <PageLead
        title="Marketing list"
        description="People who joined the waitlist. Search by name or email, view details, or export a CSV."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9"
            disabled={exporting}
            onClick={() => {
              void exportCsv();
            }}
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Export CSV
          </Button>
        }
      />

      <Directory
        title="Waitlist Directory"
        variant="framed"
        page={page}
        total={filtered.length}
        onPage={setPage}
        toolbar={
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(0);
            }}
            placeholder="Search by name or email…"
            label="Search waitlist"
          />
        }
      >
        {pageRows.length === 0 ? (
          <EmptyRow>{query.trim() ? 'No entries match that search.' : 'No waitlist entries yet.'}</EmptyRow>
        ) : (
          <>
            <ul className="divide-y divide-[#f2f4f7] md:hidden">
              {pageRows.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                  <WaitlistCell entry={entry} />
                  <span className="ml-auto flex shrink-0 items-center gap-2">
                    <Pill tone={toneFor(entry.status)}>{titleCase(entry.status)}</Pill>
                    <WaitlistActions entry={entry} onView={() => setViewId(entry.id)} />
                  </span>
                </li>
              ))}
            </ul>

            <DeskScroll className="hidden pb-1 md:block">
              <table className="w-full min-w-[720px] table-fixed">
                <thead>
                  <tr className="border-b border-[#eef0f3]">
                    <Th className={cn(listTh, 'w-[40%]', stickyStart)}>Contact</Th>
                    <Th className={cn(listTh, 'w-[14%]')}>Status</Th>
                    <Th className={cn(listTh, 'w-[18%]')}>Source</Th>
                    <Th className={cn(listTh, 'w-[20%]')}>Joined</Th>
                    <th className={cn('w-12 px-3 py-2.5', stickyEnd)}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((entry) => (
                    <tr key={entry.id} className="group border-b border-[#f2f4f7] last:border-0 hover:bg-[#fafafa]">
                      <td className={cn(td, 'py-3', stickyStart)}>
                        <WaitlistCell entry={entry} />
                      </td>
                      <td className={cn(td, 'whitespace-nowrap')}>
                        <Pill tone={toneFor(entry.status)}>{titleCase(entry.status)}</Pill>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>
                        {entry.source ? titleCase(entry.source) : '—'}
                      </td>
                      <td className={cn(td, 'whitespace-nowrap text-[#475467]')}>
                        {entry.createdAt ? formatDeskDate(entry.createdAt) : '—'}
                      </td>
                      <td className={cn('px-3 py-3 text-right', stickyEnd)}>
                        <WaitlistActions entry={entry} onView={() => setViewId(entry.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DeskScroll>
          </>
        )}
      </Directory>

      <WaitlistDetailSheet
        entryId={viewId}
        open={Boolean(viewId)}
        onOpenChange={(open) => {
          if (!open) setViewId(null);
        }}
      />
    </div>
  );
}
