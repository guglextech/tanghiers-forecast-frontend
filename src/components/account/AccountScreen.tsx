'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSession } from '@/components/app/SessionProvider';
import { LoadingState } from '@/components/app/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fieldClass = 'h-12 rounded-xl border-[#d0d5dd] bg-white px-3.5 text-[15px]';

export function AccountScreen() {
  const { user, ready, savePhone, clearPhone } = useSession();
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

  const onUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      savePhone(phone, consent);
      toast.success('Mobile number saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that number.');
    }
  };

  const onRemove = () => {
    setError('');
    try {
      clearPhone();
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
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Account</h1>
      <p className="mt-2 text-[15px] leading-6 text-[#667085]">
        Manage your mobile number and text consent.
      </p>

      <section className="mt-8 rounded-2xl border border-[#e6e8ee] px-5 py-5">
        <p className="text-[15px] text-[#101828]">{user.email}</p>
        <p className="mt-1 text-[15px] text-[#667085]">Setup complete.</p>
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
          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[#344054]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 size-4 accent-[#2563eb]"
            />
            <span>
              I agree to receive text messages about forecasts when delivery becomes available.
              Optional.
            </span>
          </label>
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

      <Link
        href="/feed"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-[#101828] px-5 text-sm font-semibold text-white hover:bg-[#1d2939]"
      >
        View public feed
      </Link>
    </div>
  );
}
