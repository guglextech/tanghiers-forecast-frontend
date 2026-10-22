'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserAvatar } from '@/components/chrome/UserAvatar';

const fieldClass = 'h-12 rounded-xl border-[#d0d5dd] bg-white px-3.5 text-[15px]';

export function AccountScreen() {
  const { user, ready, savePhone, clearPhone, logout } = useSession();
  const router = useRouter();
  const [phone, setPhone] = React.useState('');
  const [consent, setConsent] = React.useState(false);
  const [error, setError] = React.useState('');
  const [confirmRemove, setConfirmRemove] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setPhone(user.phone);
    setConsent(user.smsConsent);
  }, [user]);

  if (!ready || !user) return <LoadingState label="Loading your account…" />;

  const stored = user.phone
    ? `Stored: ${user.phone} · ${user.smsConsent ? 'Consent given' : 'No consent'} · Not verified`
    : '';

  const onUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await savePhone(phone, consent);
      toast.success('Mobile number saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that number.');
    }
  };

  const onRemove = async () => {
    setError('');
    try {
      await clearPhone();
      setPhone('');
      setConsent(false);
      setConfirmRemove(false);
      toast.success('Mobile number removed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that number.');
    }
  };

  return (
    <div>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 text-[15px] leading-6 text-[#667085]">
        Manage your mobile number and text consent.
      </p>

      <section className="mt-8 flex items-center gap-4 rounded-2xl border border-[#e6e8ee] px-5 py-5">
        <UserAvatar name={user.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#101828]">{user.name}</p>
          <p className="truncate text-sm text-[#667085]">{user.email}</p>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[#e6e8ee] px-5 py-5">
        <h2 className="text-[15px] font-semibold text-[#101828]">Mobile number</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#667085]">
          Text message delivery is not active yet. Nothing is sent to your number and it is not
          verified. Saving a number or consent only records your choice.
        </p>
        <form onSubmit={onUpdate} className="mt-5">
          <label htmlFor="phone" className="text-sm font-semibold text-[#101828]">
            Mobile number (required, with country code)
          </label>
          <Input
            id="phone"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+233550982043"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={`mt-2 ${fieldClass}`}
          />
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#e6e8ee] bg-[#f7f8fa] px-4 py-3.5">
            <div className="min-w-0 pr-2">
              <Label htmlFor="sms-consent" className="text-[15px] font-semibold text-[#101828]">
                Text messages
              </Label>
              <p id="sms-consent-desc" className="mt-1 text-sm leading-5 text-[#667085]">
                I agree to receive text messages about forecasts when delivery becomes available.
                Optional.
              </p>
            </div>
            <Switch
              id="sms-consent"
              size="lg"
              checked={consent}
              onCheckedChange={setConsent}
              aria-describedby="sms-consent-desc"
            />
          </div>
          {stored ? <p className="mt-4 text-sm text-[#667085]">{stored}</p> : null}
          {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" className="h-11 px-5">
              Update
            </Button>
            {confirmRemove ? (
              <Button type="button" variant="outline" className="h-11 border-[#d0d5dd] px-5" onClick={onRemove}>
                Confirm remove
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-11 border-[#d0d5dd] px-5"
                disabled={!user.phone}
                onClick={() => setConfirmRemove(true)}
              >
                Remove number
              </Button>
            )}
          </div>
        </form>
      </section>

      <section className="mt-4 rounded-2xl border border-[#e6e8ee] px-5 py-5">
        <h2 className="text-[15px] font-semibold">Subscription and messages</h2>
        <p className="mt-2 text-sm leading-6 text-[#667085]">
          Plan status, invoices, and the record of forecast delivery live beside this page.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
          <Link href="/subscription" className="text-[#101828] hover:underline">
            Manage subscription
          </Link>
          <Link href="/messages" className="text-[#101828] hover:underline">
            Delivery messages
          </Link>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href="/feed"
          className="inline-flex h-11 items-center rounded-full bg-[#101828] px-5 text-sm font-semibold text-white hover:bg-[#1d2939]"
        >
          View public feed
        </Link>
        <button
          type="button"
          className="text-sm font-medium text-[#667085] hover:text-[#101828] md:hidden"
          onClick={() => {
            logout();
            router.push('/');
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
