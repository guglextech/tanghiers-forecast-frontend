'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  CreditCard,
  Download,
  Loader2,
  Shield,
  Smartphone,
  Trash2,
} from '@/components/ui/icons';
import { toast } from 'sonner';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput, countryFromE164, nationalFromE164, toE164 } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { initialsFromName } from '@/lib/session';
import { cn } from '@/lib/utils';

const TIMEZONES = [
  'Africa/Accra',
  'Africa/Lagos',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/New_York',
  'America/Toronto',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'UTC',
];

function detectedTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch {
    return 'America/New_York';
  }
}

function zoneLabel(zone: string) {
  return zone.replace(/_/g, ' ');
}

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('233') && digits.length >= 12) {
    return `+233 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
  }
  if (digits.startsWith('1') && digits.length === 11) {
    return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.startsWith('44') && digits.length >= 12) {
    return `+44 ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return phone.startsWith('+') ? phone : `+${digits}`;
}

function accountType(role: string) {
  return role === 'admin' ? 'Admin' : 'Customer';
}

function Section({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="px-1 text-xs font-semibold tracking-[0.08em] text-[#98a2b3] uppercase">{title}</h2>
      <div className="mt-2 divide-y divide-[#f0f1f4] overflow-hidden rounded-xl border border-[#e4e7ec] bg-white">
        {children}
      </div>
      {footer ? <p className="mt-2 px-1 text-xs leading-5 text-[#98a2b3]">{footer}</p> : null}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <dt className="shrink-0 text-sm text-[#667085]">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-[#101828]">{value}</dd>
    </div>
  );
}

const ICON_TONES = {
  blue: 'bg-[#eef4ff] text-[#0B3A82]',
  green: 'bg-[#ecfdf3] text-[#067647]',
  slate: 'bg-[#f2f4f7] text-[#344054]',
  danger: 'bg-[#fef3f2] text-[#b42318]',
} as const;

function SettingRow({
  icon: Icon,
  title,
  hint,
  tone = 'slate',
  interactive = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  hint?: string;
  tone?: keyof typeof ICON_TONES;
  interactive?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-left',
        interactive && 'transition-colors hover:bg-[#f9fafb]',
      )}
    >
      <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', ICON_TONES[tone])}>
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', tone === 'danger' ? 'text-[#b42318]' : 'text-[#101828]')}>
          {title}
        </p>
        {hint ? <p className="mt-0.5 text-xs leading-[18px] text-[#98a2b3]">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

const PILL_TONES = {
  success: 'bg-[#ecfdf3] text-[#067647]',
  warning: 'bg-[#fef3f2] text-[#b42318]',
  neutral: 'bg-[#f2f4f7] text-[#667085]',
} as const;

function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: keyof typeof PILL_TONES }) {
  return (
    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', PILL_TONES[tone])}>
      {children}
    </span>
  );
}

export function AccountScreen() {
  const { user, ready, refresh, updateProfile, clearPhone, exportAccount, deleteAccount } =
    useSession();
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [timezone, setTimezone] = React.useState('');
  const [phoneCountry, setPhoneCountry] = React.useState('US');
  const [phoneNational, setPhoneNational] = React.useState('');
  const [consent, setConsent] = React.useState(false);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setTimezone(user.timezone || detectedTimezone());
    const nextCountry = user.countryCode || countryFromE164(user.phone) || 'US';
    setPhoneCountry(nextCountry);
    setPhoneNational(nationalFromE164(user.phone, nextCountry));
    setConsent(user.smsConsent);
    setConfirmRemove(false);
  }, [user]);

  if (!ready || !user) return <LoadingState label="Loading your account…" />;

  const zones = timezone && !TIMEZONES.includes(timezone) ? [timezone, ...TIMEZONES] : TIMEZONES;
  const phoneLabel = formatPhoneDisplay(user.phone);
  const typeLabel = accountType(user.role);
  const planLabel =
    user.subscriptionStatus === 'active'
      ? 'Active'
      : user.subscriptionStatus === 'canceled'
        ? 'Canceled'
        : 'None';

  const persist = async (nextConsent = consent) => {
    await updateProfile({
      firstName,
      lastName,
      timezone,
      phone: toE164(phoneCountry, phoneNational),
      smsConsent: nextConsent,
    });
  };

  const onUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await persist();
      setEditing(false);
      toast.success('Profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const onSmsChange = async (value: boolean) => {
    setConsent(value);
    setError('');
    try {
      await persist(value);
    } catch (err) {
      setConsent(!value);
      setError(err instanceof Error ? err.message : 'Could not update text messages.');
    }
  };

  const onRemove = async () => {
    setError('');
    try {
      await clearPhone();
      setPhoneNational('');
      setConsent(false);
      setConfirmRemove(false);
      toast.success('Mobile number removed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that number.');
    }
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const data = await exportAccount();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tanghiers-account-export.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloading.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not export your data.');
    } finally {
      setExporting(false);
    }
  };

  const onDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success('Account deleted.');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete this account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#101828]">Settings</h1>
      <p className="mt-1 text-sm text-[#667085]">Manage your account and preferences.</p>

      <section className="mt-6 overflow-hidden rounded-xl border border-[#e4e7ec] bg-white">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0B3A82] text-sm font-semibold tracking-wide text-white">
            {initialsFromName(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-[#101828]">{user.name}</p>
            <p className="truncate text-sm text-[#667085]">{user.email}</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 shrink-0 px-3"
            onClick={() => {
              setEditing((open) => !open);
              setError('');
            }}
          >
            {editing ? 'Close' : 'Edit'}
          </Button>
        </div>

        {editing ? (
          <form onSubmit={onUpdate} className="space-y-3.5 border-t border-[#f0f1f4] px-4 py-4">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Choose a timezone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zoneLabel(zone)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="phone">Mobile number</Label>
                {user.phone ? (
                  confirmRemove ? (
                    <button type="button" className="text-xs font-medium text-[#b42318]" onClick={onRemove}>
                      Confirm remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-medium text-[#98a2b3] hover:text-[#101828]"
                      onClick={() => setConfirmRemove(true)}
                    >
                      Remove
                    </button>
                  )
                ) : null}
              </div>
              <PhoneInput
                id="phone"
                countries={[]}
                countryCode={phoneCountry}
                onCountryChange={setPhoneCountry}
                value={phoneNational}
                onChange={setPhoneNational}
              />
            </div>
            {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={saving}
                className="bg-[#0B3A82] text-white hover:bg-[#092e68]"
              >
                {saving ? 'Saving' : 'Save changes'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <dl className="divide-y divide-[#f0f1f4] border-t border-[#f0f1f4]">
              <Fact label="Phone" value={phoneLabel || '—'} />
              <Fact label="Timezone" value={zoneLabel(user.timezone || detectedTimezone())} />
              <Fact label="Account" value={typeLabel} />
            </dl>
            {error ? <p className="border-t border-[#f0f1f4] px-4 py-2.5 text-sm text-[#b42318]">{error}</p> : null}
          </>
        )}
      </section>

      <Section title="Plan">
        <Link href="/subscription" className="block">
          <SettingRow icon={CreditCard} title="Subscription" hint="Plan, billing, and renewal" tone="blue" interactive>
            <StatusPill tone={user.subscriptionStatus === 'active' ? 'success' : 'neutral'}>{planLabel}</StatusPill>
            <ChevronRight className="size-4 text-[#d0d5dd]" />
          </SettingRow>
        </Link>
      </Section>

      <Section
        title="Preferences"
        footer={
          <>
            Text consent is optional. Up to 1 msg/day, msg &amp; data rates may apply, reply STOP to cancel. See the{' '}
            <Link href="/messaging" className="font-medium text-[#667085] underline-offset-2 hover:underline">
              messaging policy
            </Link>
            .
          </>
        }
      >
        <SettingRow icon={Smartphone} title="Forecast texts" hint="Get the daily forecast by text" tone="green">
          <Switch checked={consent} onCheckedChange={onSmsChange} aria-label="Forecast texts" />
        </SettingRow>
      </Section>

      <Section title="Security">
        <SettingRow
          icon={Shield}
          title="Email verification"
          hint={user.emailVerified ? 'Your email is confirmed' : 'Confirm your email to protect this account'}
          tone="blue"
        >
          <StatusPill tone={user.emailVerified ? 'success' : 'warning'}>
            {user.emailVerified ? 'Verified' : 'Needed'}
          </StatusPill>
        </SettingRow>
      </Section>

      {/* <button type="button" className="block w-full" disabled={exporting} onClick={onExport}>
        <SettingRow
          icon={Download}
          title="Export data"
          hint={exporting ? 'Preparing your download' : 'Download a copy of your account'}
        >
          {exporting ? <Loader2 className="size-4 animate-spin text-[#667085]" aria-hidden /> : null}
        </SettingRow>
      </button> */}

      <Section title="Danger zone">
        {showDelete ? (
          <form onSubmit={onDelete} className="space-y-3 px-4 py-3.5">
            <p className="text-sm text-[#667085]">Enter your password to permanently delete this account.</p>
            <Input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowDelete(false);
                  setDeletePassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={deleting}
                className="bg-[#d92d20] text-white hover:bg-[#b42318]"
              >
                {deleting ? 'Deleting' : 'Delete account'}
              </Button>
            </div>
          </form>
        ) : (
          <button type="button" className="block w-full" onClick={() => setShowDelete(true)}>
            <SettingRow
              icon={Trash2}
              title="Delete account"
              hint="Permanently remove this login"
              tone="danger"
              interactive
            >
              <ChevronRight className="size-4 text-[#fda29b]" />
            </SettingRow>
          </button>
        )}
      </Section>
    </div>
  );
}
