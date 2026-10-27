'use client';

import * as React from 'react';
import { MoreHorizontal } from 'lucide-react';
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
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{profile.name}</SheetTitle>
            <SheetDescription>{profile.email}</SheetDescription>
          </SheetHeader>
          <dl className="grid gap-4 px-5 py-4 text-sm">
            <div>
              <dt className="text-[#98a2b3]">Role</dt>
              <dd className="mt-1">{profile.roleLabel}</dd>
            </div>
            <div>
              <dt className="text-[#98a2b3]">Status</dt>
              <dd className="mt-1 capitalize">{profile.status}</dd>
            </div>
            {plan ? (
              <div>
                <dt className="text-[#98a2b3]">Plan</dt>
                <dd className="mt-1">{plan.name}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[#98a2b3]">Email</dt>
              <dd className="mt-1">{profile.emailVerified ? 'Verified' : 'Not verified'}</dd>
            </div>
            <div>
              <dt className="text-[#98a2b3]">Phone</dt>
              <dd className="mt-1">
                {profile.phone || '—'}
                {profile.phone ? ` · ${profile.phoneVerified ? 'Verified' : 'Not verified'}` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-[#98a2b3]">Authenticator</dt>
              <dd className="mt-1">{profile.mfaEnabled ? 'On' : 'Off'}</dd>
            </div>
            <div>
              <dt className="text-[#98a2b3]">Country</dt>
              <dd className="mt-1">{profile.countryCode || '—'}</dd>
            </div>
            <div>
              <dt className="text-[#98a2b3]">Timezone</dt>
              <dd className="mt-1">{profile.timezone || '—'}</dd>
            </div>
            <div>
              <dt className="text-[#98a2b3]">Joined</dt>
              <dd className="mt-1">{profile.createdAt ? formatDateTime(profile.createdAt) : '—'}</dd>
            </div>
            <div>
              <dt className="text-[#98a2b3]">Last login</dt>
              <dd className="mt-1">{profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : 'Never'}</dd>
            </div>
          </dl>
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
