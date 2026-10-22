'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
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
import { UserAvatar } from '@/components/chrome/UserAvatar';
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

function FieldRow({
  label,
  htmlFor,
  align = 'center',
  children,
}: {
  label: string;
  htmlFor?: string;
  align?: 'center' | 'start';
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid gap-2 px-5 py-4 sm:grid-cols-[8.75rem_minmax(0,1fr)] sm:gap-8',
        align === 'center' ? 'sm:items-center' : 'sm:items-start',
      )}
    >
      <Label htmlFor={htmlFor} className={cn('text-[#344054]', align === 'start' && 'sm:pt-2')}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function NavRow({
  href,
  label,
  detail,
}: {
  href: string;
  label: string;
  detail?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#f7f8fa]"
    >
      <span className="text-sm font-medium text-[#101828]">{label}</span>
      <span className="ml-auto truncate text-sm text-[#667085]">{detail}</span>
      <ChevronRight className="size-4 shrink-0 text-[#d0d5dd]" />
    </Link>
  );
}

export function AccountScreen() {
  const { user, ready, refresh, updateProfile, clearPhone, exportAccount, deleteAccount, logout } =
    useSession();
  const router = useRouter();
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
  const planLabel =
    user.subscriptionStatus === 'active'
      ? 'Active'
      : user.subscriptionStatus === 'canceled'
        ? 'Canceled'
        : 'No plan';

  const onUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        timezone,
        phone: toE164(phoneCountry, phoneNational),
        smsConsent: consent,
      });
      toast.success('Profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
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
    <div className="mx-auto max-w-xl">
      <p className="text-[11px] font-medium tracking-[0.16em] text-[#98a2b3] uppercase">Account</p>
      <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight">Profile</h1>

      <section className="mt-8 flex items-center gap-4">
        <UserAvatar name={user.name} size="lg" className="size-12 data-[size=lg]:size-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-[#101828]">{user.name}</p>
          <p className="mt-0.5 truncate text-sm text-[#667085]">{user.email}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.12em] uppercase',
            user.emailVerified ? 'bg-[#ecfdf3] text-[#027a48]' : 'bg-[#f7f8fa] text-[#667085]',
          )}
        >
          {user.emailVerified ? 'Verified' : 'Unverified'}
        </span>
      </section>

      <form onSubmit={onUpdate} className="mt-8">
        <div className="overflow-hidden rounded-2xl border border-[#e6e8ee]">
          <FieldRow label="First name" htmlFor="firstName">
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </FieldRow>
          <div className="h-px bg-[#eef0f3]" />
          <FieldRow label="Last name" htmlFor="lastName">
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </FieldRow>
          <div className="h-px bg-[#eef0f3]" />
          <FieldRow label="Timezone" htmlFor="timezone">
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
          </FieldRow>
          <div className="h-px bg-[#eef0f3]" />
          <FieldRow label="Mobile" htmlFor="phone" align="start">
            <div className="space-y-2">
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
          </FieldRow>
          <div className="h-px bg-[#eef0f3]" />
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <Label htmlFor="sms-consent" className="text-[#344054]">
                Text messages
              </Label>
              <p id="sms-consent-desc" className="mt-1 text-xs leading-5 text-[#98a2b3]">
                Optional. Delivery is not live yet.
              </p>
            </div>
            <Switch
              id="sms-consent"
              checked={consent}
              onCheckedChange={setConsent}
              aria-describedby="sms-consent-desc"
            />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}

        <div className="mt-4 flex justify-end">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#e6e8ee]">
        <NavRow href="/subscription" label="Subscription" detail={planLabel} />
        <div className="h-px bg-[#eef0f3]" />
        <NavRow href="/messages" label="Messages" />
        <div className="h-px bg-[#eef0f3]" />
        <button
          type="button"
          className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#f7f8fa] disabled:opacity-60"
          disabled={exporting}
          onClick={onExport}
        >
          <span className="text-sm font-medium text-[#101828]">Export data</span>
          <span className="ml-auto text-sm text-[#667085]">{exporting ? 'Preparing…' : ''}</span>
          <ChevronRight className="size-4 shrink-0 text-[#d0d5dd]" />
        </button>
      </div>

      <div className="mt-8">
        {showDelete ? (
          <form onSubmit={onDelete} className="space-y-3">
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
              <Button type="submit" size="sm" variant="outline" disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete account'}
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              className="text-sm text-[#98a2b3] transition-colors hover:text-[#b42318]"
              onClick={() => setShowDelete(true)}
            >
              Delete account
            </button>
            <button
              type="button"
              className="text-sm text-[#98a2b3] transition-colors hover:text-[#101828] md:hidden"
              onClick={() => {
                logout();
                router.push('/');
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
