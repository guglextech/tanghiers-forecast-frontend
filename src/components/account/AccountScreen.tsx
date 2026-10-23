'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Clock, CreditCard, Download, Loader2, Mail, Shield, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
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

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-[28px] bg-[#f4f6f8] px-5 py-5 sm:px-6 sm:py-6', className)}>
      {children}
    </section>
  );
}

function CardHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="px-1">
      <h2 className="text-[17px] font-semibold tracking-tight text-[#101828]">{title}</h2>
      <p className="mt-0.5 text-sm text-[#98a2b3]">{hint}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-[0.14em] text-[#98a2b3] uppercase">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-[#101828]">{value}</p>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  hint,
  tone = 'default',
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  hint: string;
  tone?: 'default' | 'danger';
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-1 py-3.5">
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full bg-white',
          tone === 'danger' ? 'text-[#b42318]' : 'text-[#101828]',
        )}
      >
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className={cn('text-sm font-semibold', tone === 'danger' ? 'text-[#b42318]' : 'text-[#101828]')}>
          {title}
        </p>
        <p className="mt-0.5 text-sm leading-5 text-[#98a2b3]">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-[#e8f1ff] px-2.5 py-1 text-xs font-medium text-[#2e90fa]">
      {children}
    </span>
  );
}

function ThemeRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <SettingRow icon={Clock} title="Dark theme" hint="Switch between light and dark mode">
      <Switch
        size="lg"
        checked={isDark}
        onCheckedChange={(on) => setTheme(on ? 'dark' : 'light')}
        aria-label="Dark theme"
      />
    </SettingRow>
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
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#101828]">Settings</h1>
      <p className="mt-1 text-sm text-[#98a2b3]">Manage your account and preferences.</p>

      <Card className="mt-8">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold tracking-wide text-[#101828]">
            {initialsFromName(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-semibold tracking-tight text-[#101828]">{user.name}</p>
            <p className="mt-0.5 truncate text-sm text-[#98a2b3]">{phoneLabel || 'No mobile number'}</p>
          </div>
          <button
            type="button"
            className="shrink-0 text-sm font-medium text-[#667085] hover:text-[#101828]"
            onClick={() => {
              setEditing((open) => !open);
              setError('');
            }}
          >
            {editing ? 'Close' : 'Edit'}
          </button>
        </div>

        <div className="mt-5 border-t border-[#e8eaee] pt-5">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Fact label="Full name" value={user.name} />
            <Fact label="Phone" value={phoneLabel || '—'} />
            <Fact label="Email" value={user.email} />
            <Fact label="Account" value={typeLabel} />
          </div>
        </div>

        {editing ? (
          <form onSubmit={onUpdate} className="mt-6 space-y-4 border-t border-[#e8eaee] pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <PhoneInput
                id="phone"
                countries={[]}
                countryCode={phoneCountry}
                onCountryChange={setPhoneCountry}
                value={phoneNational}
                onChange={setPhoneNational}
              />
              {user.phone ? (
                <div className="flex justify-end">
                  {confirmRemove ? (
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
                  )}
                </div>
              ) : null}
            </div>
            {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={saving}>
                {saving ? 'Saving' : 'Save changes'}
              </Button>
            </div>
          </form>
        ) : error ? (
          <p className="mt-4 text-sm text-[#b42318]">{error}</p>
        ) : null}
      </Card>

      <Card className="mt-4">
        <CardHeading title="Preferences" hint="Display and app behaviour." />
        <div className="mt-2 divide-y divide-[#e8eaee]">
          <ThemeRow />
          <SettingRow icon={Bell} title="Forecast texts" hint="Optional. Delivery is not live yet.">
            <Switch
              size="lg"
              checked={consent}
              onCheckedChange={onSmsChange}
              aria-label="Forecast texts"
            />
          </SettingRow>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeading title="Security" hint="How you sign in and protect this account." />
        <div className="mt-2 divide-y divide-[#e8eaee]">
          <SettingRow
            icon={Shield}
            title="Email verification"
            hint={user.emailVerified ? 'Your email is confirmed' : 'Confirm your email to protect this account'}
          >
            <StatusPill>{user.emailVerified ? 'Active' : 'Needed'}</StatusPill>
          </SettingRow>
          <SettingRow icon={Shield} title="Two-factor authentication" hint="Extra protection beyond your password">
            <StatusPill>Soon</StatusPill>
          </SettingRow>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeading title="Notifications" hint="Choose how we reach you." />
        <div className="mt-2 divide-y divide-[#e8eaee]">
          <SettingRow icon={Bell} title="Push notifications" hint="Forecast updates on this device">
            <StatusPill>Soon</StatusPill>
          </SettingRow>
          <SettingRow icon={Mail} title="Email receipts" hint="Send receipts to your email">
            <StatusPill>Soon</StatusPill>
          </SettingRow>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeading title="Account" hint="Plan, data, and this login." />
        <div className="mt-2 divide-y divide-[#e8eaee]">
          <Link href="/subscription" className="block">
            <SettingRow icon={CreditCard} title="Subscription" hint="Plan, billing, and renewal">
              <StatusPill>{planLabel}</StatusPill>
            </SettingRow>
          </Link>
          <button type="button" className="block w-full" disabled={exporting} onClick={onExport}>
            <SettingRow
              icon={Download}
              title="Export data"
              hint={exporting ? 'Preparing your download' : 'Download a copy of your account'}
            >
              {exporting ? <Loader2 className="size-4 animate-spin text-[#667085]" aria-hidden /> : null}
            </SettingRow>
          </button>
          {showDelete ? (
            <form onSubmit={onDelete} className="space-y-3 px-1 py-4">
              <p className="text-sm text-[#667085]">Enter your password to delete this account.</p>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
              />
              <div className="flex items-center gap-4">
                <Button type="submit" size="sm" variant="outline" loading={deleting}>
                  {deleting ? 'Deleting' : 'Delete account'}
                </Button>
                <button
                  type="button"
                  className="text-sm font-medium text-[#667085] hover:text-[#101828]"
                  onClick={() => {
                    setShowDelete(false);
                    setDeletePassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className="block w-full" onClick={() => setShowDelete(true)}>
              <SettingRow
                icon={Trash2}
                title="Delete account"
                hint="Permanently remove this login"
                tone="danger"
              />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
