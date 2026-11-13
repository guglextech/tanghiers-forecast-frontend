'use client';

import * as React from 'react';
import {
  CalendarDays,
  Clock,
  Mail,
  MoreHorizontal,
  Shield,
  Smartphone,
  Tag,
  Users,
  type LucideIcon,
} from '@/components/ui/icons';
import { toast } from 'sonner';
import { admin } from '@/lib/api/resources';
import { mapAdminUser, type AdminAccount } from '@/lib/api/mappers';
import { useSession } from '@/components/app/SessionProvider';
import { formatDateTime } from '@/lib/dates';
import { planById } from '@/data/site';
import { ConfirmDrawer } from '@/components/admin/ConfirmDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type ConfirmAction = 'disable' | 'enable' | 'erase' | 'make-admin' | 'remove-admin';

const confirmCopy: Record<ConfirmAction, { title: string; description: string; confirm: string; needsCode?: boolean }> = {
  disable: {
    title: 'Disable this account?',
    description: 'They will be signed out everywhere and cannot sign in. Billing is unchanged.',
    confirm: 'Disable',
  },
  enable: {
    title: 'Enable this account?',
    description: 'They will be able to sign in again.',
    confirm: 'Enable',
  },
  erase: {
    title: 'Erase this account?',
    description: 'This is a privacy erasure. The account is removed permanently and cannot be undone.',
    confirm: 'Erase account',
  },
  'make-admin': {
    title: 'Make this person an admin?',
    description:
      'They will get desk access. Their sessions end, and they must set up an authenticator at next login. Enter your current authenticator code to confirm.',
    confirm: 'Make admin',
    needsCode: true,
  },
  'remove-admin': {
    title: 'Remove admin access?',
    description: 'They will lose desk access. You cannot remove the last admin, or yourself. Enter your current authenticator code to confirm.',
    confirm: 'Remove admin',
    needsCode: true,
  },
};

function AccountDetail({
  icon: Icon,
  label,
  value,
  tone = 'blue',
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: 'blue' | 'green' | 'violet' | 'slate';
  note?: React.ReactNode;
}) {
  const tones = {
    blue: 'bg-[#eef4ff] text-[#0B3A82]',
    green: 'bg-[#ecfdf3] text-[#067647]',
    violet: 'bg-[#f4f3ff] text-[#5925dc]',
    slate: 'bg-[#f2f4f7] text-[#475467]',
  } as const;

  return (
    <div className="min-w-0 py-2">
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-full ${tones[tone]}`}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#98a2b3]">{label}</p>
          <div className="mt-0.5 truncate text-sm font-semibold text-[#101828]">{value}</div>
          {note ? <div className="mt-1">{note}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function SubscriberActions({
  account,
  onChanged,
}: {
  account: AdminAccount;
  onChanged: () => void;
}) {
  const { user } = useSession();
  const [busy, setBusy] = React.useState(false);
  const [confirm, setConfirm] = React.useState<ConfirmAction | null>(null);
  const [code, setCode] = React.useState('');
  const [detail, setDetail] = React.useState<AdminAccount | null>(null);
  const isSelf = user?.id === account.id;
  const isAdmin = account.role === 'admin';

  const closeConfirm = () => {
    if (busy) return;
    setConfirm(null);
    setCode('');
  };

  const run = async (action: ConfirmAction) => {
    setBusy(true);
    try {
      if (action === 'disable') {
        await admin.disableUser(account.id);
        toast.success('Account disabled.');
      } else if (action === 'enable') {
        await admin.enableUser(account.id);
        toast.success('Account enabled.');
      } else if (action === 'make-admin') {
        await admin.makeAdmin(account.id, code);
        toast.success('Admin access granted.');
      } else if (action === 'remove-admin') {
        await admin.removeAdmin(account.id, code);
        toast.success('Admin access removed.');
      } else {
        await admin.eraseUser(account.id);
        toast.success('Account erased.');
      }
      setConfirm(null);
      setCode('');
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update this account.');
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async () => {
    setBusy(true);
    try {
      const row = await admin.user(account.id);
      setDetail(mapAdminUser(row));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load this account.');
    } finally {
      setBusy(false);
    }
  };

  const copy = confirm ? confirmCopy[confirm] : null;
  const needsCode = Boolean(copy?.needsCode);
  const canSubmit = Boolean(confirm) && !busy && (!needsCode || code.length === 6);
  const profile = detail ?? account;
  const plan = planById(profile.planId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={busy}
            aria-label={`Actions for ${account.name}`}
            className="grid size-8 place-items-center rounded-full text-[#667085] transition-colors hover:bg-[#f2f4f7] hover:text-[#101828] disabled:opacity-50"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuItem
            disabled={busy}
            onSelect={() => {
              void openDetail();
            }}
          >
            View
          </DropdownMenuItem>
          {!isSelf && !isAdmin && !account.disabled ? (
            <DropdownMenuItem
              onSelect={() => {
                setCode('');
                setConfirm('make-admin');
              }}
            >
              Make admin
            </DropdownMenuItem>
          ) : null}
          {!isSelf && isAdmin ? (
            <DropdownMenuItem
              onSelect={() => {
                setCode('');
                setConfirm('remove-admin');
              }}
            >
              Remove admin
            </DropdownMenuItem>
          ) : null}
          {!isSelf && !account.disabled ? (
            <DropdownMenuItem onSelect={() => setConfirm('disable')}>
              Disable
            </DropdownMenuItem>
          ) : null}
          {!isSelf && account.disabled ? (
            <DropdownMenuItem onSelect={() => setConfirm('enable')}>
              Enable
            </DropdownMenuItem>
          ) : null}
          {!isSelf ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirm('erase')}>
                Erase
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader className="bg-white py-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#0B3A82] text-sm font-semibold text-white">
                {profile.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <SheetTitle className="truncate text-lg">{profile.name}</SheetTitle>
                <SheetDescription className="mt-0.5 truncate">{profile.email}</SheetDescription>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="inline-flex rounded-full bg-[#eef4ff] px-2.5 py-1 text-xs font-semibold text-[#0B3A82] capitalize">
                {profile.role}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                  profile.status === 'active'
                    ? 'bg-[#ecfdf3] text-[#067647]'
                    : 'bg-[#f2f4f7] text-[#475467]'
                }`}
              >
                {profile.status}
              </span>
              {plan ? (
                <span className="inline-flex rounded-full bg-[#f4f3ff] px-2.5 py-1 text-xs font-semibold text-[#5925dc]">
                  {plan.name}
                </span>
              ) : null}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto bg-white px-5">
            <section className="py-5">
              <h3 className="mb-2.5 text-[11px] font-semibold tracking-wide text-[#667085] uppercase">Contact</h3>
              <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
                <AccountDetail
                  icon={Mail}
                  label="Email"
                  value={profile.email}
                  tone="blue"
                  note={
                    <span
                      className={`text-xs font-medium ${
                        profile.emailVerified ? 'text-[#067647]' : 'text-[#b42318]'
                      }`}
                    >
                      {profile.emailVerified ? 'Verified' : 'Not verified'}
                    </span>
                  }
                />
                <AccountDetail
                  icon={Smartphone}
                  label="Phone"
                  value={profile.phone || 'Not added'}
                  tone="green"
                  note={
                    profile.phone ? (
                      <span
                        className={`text-xs font-medium ${
                          profile.phoneVerified ? 'text-[#067647]' : 'text-[#b42318]'
                        }`}
                      >
                        {profile.phoneVerified ? 'Verified' : 'Not verified'}
                      </span>
                    ) : null
                  }
                />
              </div>
            </section>

            <section className="py-5">
              <h3 className="mb-2.5 text-[11px] font-semibold tracking-wide text-[#667085] uppercase">Account details</h3>
              <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
                <AccountDetail
                  icon={Shield}
                  label="Authenticator"
                  value={profile.mfaEnabled ? 'Enabled' : 'Off'}
                  tone="violet"
                />
                <AccountDetail
                  icon={Users}
                  label="Country"
                  value={profile.countryCode || 'Not set'}
                  tone="green"
                />
                <AccountDetail
                  icon={Clock}
                  label="Timezone"
                  value={profile.timezone || 'Not set'}
                  tone="blue"
                />
                <AccountDetail
                  icon={Tag}
                  label="Membership"
                  value={plan?.name || 'No plan'}
                  tone="slate"
                />
              </div>
            </section>

            <section className="py-5">
              <h3 className="mb-2.5 text-[11px] font-semibold tracking-wide text-[#667085] uppercase">Activity</h3>
              <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
                <AccountDetail
                  icon={CalendarDays}
                  label="Joined"
                  value={profile.createdAt ? formatDateTime(profile.createdAt) : 'Unknown'}
                  tone="blue"
                />
                <AccountDetail
                  icon={Clock}
                  label="Last login"
                  value={profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : 'Never'}
                  tone="slate"
                />
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDrawer
        open={Boolean(confirm)}
        title={copy?.title ?? ''}
        description={copy?.description ?? ''}
        subject={{ title: account.name, detail: account.email }}
        confirmLabel={copy?.confirm ?? 'Confirm'}
        busy={busy}
        destructive={confirm === 'erase'}
        disabled={!canSubmit}
        onClose={closeConfirm}
        onConfirm={() => {
          if (confirm) void run(confirm);
        }}
      >
        {needsCode ? (
          <div className="mt-6">
            <p className="text-sm font-medium text-[#101828]">Authenticator code</p>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={busy}
              autoFocus
              inputMode="numeric"
              containerClassName="mt-4 justify-start"
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-11 w-10 text-base font-medium shadow-none"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        ) : null}
      </ConfirmDrawer>
    </>
  );
}
