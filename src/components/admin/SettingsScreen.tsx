'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { admin } from '@/lib/api/resources';
import {
  mapProductSettings,
  productSettingsBody,
  type ProductSettingsForm,
} from '@/lib/api/mappers';
import { LoadingState } from '@/components/app/LoadingState';
import { PageLead } from '@/components/admin/desk-ui';
import { Button } from '@/components/ui/button';
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

const emptyForm: ProductSettingsForm = {
  slug: '',
  name: '',
  timezone: 'America/New_York',
  minAge: '18',
  supportEmail: '',
  mailingAddress: '',
  verifyEmailUrl: '',
  resetPasswordUrl: '',
  accountUrl: '',
  accentColor: '#0B3A82',
  fields: [],
};

function Card({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[#e4e7ec] bg-white">
      <div className="border-b border-[#eef0f3] px-5 py-4">
        <h2 className="text-sm font-semibold text-[#101828]">{title}</h2>
        <p className="mt-1 text-sm text-[#667085]">{hint}</p>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ?? 'space-y-2'}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-[#98a2b3]">{hint}</p> : null}
    </div>
  );
}

function zoneLabel(zone: string) {
  return zone.replace(/_/g, ' ');
}

export function SettingsScreen() {
  const [form, setForm] = React.useState<ProductSettingsForm>(emptyForm);
  const [ready, setReady] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const set = <K extends keyof ProductSettingsForm>(key: K, value: ProductSettingsForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  React.useEffect(() => {
    let cancelled = false;
    void admin
      .product()
      .then((payload) => {
        if (!cancelled) setForm(mapProductSettings(payload));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load settings.');
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError('Enter a product name.');
      return;
    }
    if (form.supportEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail.trim())) {
      setError('Enter a valid support email.');
      return;
    }
    if (form.accentColor.trim() && !/^#([0-9a-fA-F]{6})$/.test(form.accentColor.trim())) {
      setError('Accent color should be a six-digit hex, like #0B3A82.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const saved = await admin.updateProduct(productSettingsBody(form));
      const next = mapProductSettings(saved);
      setForm(next.name || next.slug ? next : form);
      toast.success('Settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <LoadingState label="Loading settings…" />;
  if (error && !form.slug && !form.name) {
    return (
      <div className="space-y-3">
        <PageLead title="Settings" description="Name, timezone, and the addresses used in email and on the site." />
        <p className="text-sm text-[#b42318]">{error}</p>
      </div>
    );
  }

  const zones = form.timezone && !TIMEZONES.includes(form.timezone) ? [form.timezone, ...TIMEZONES] : TIMEZONES;

  return (
    <form className="space-y-5" onSubmit={(event) => void submit(event)}>
      <PageLead
        title="Settings"
        description="Name, timezone, and the addresses used in email and on the site."
        action={
          <Button
            type="submit"
            size="sm"
            loading={saving}
            className="h-9 bg-[#0B3A82] px-3.5 hover:bg-[#092d66]"
          >
            Save changes
          </Button>
        }
      />

      {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

      <Card title="Product" hint="Shown on the public site and in email.">
        <Field id="product-name" label="Name">
          <Input
            id="product-name"
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
            placeholder="Tanghiers Forecast"
          />
        </Field>
        <Field id="product-slug" label="Slug" hint="Set in the API. It cannot be changed here.">
          <Input id="product-slug" value={form.slug} readOnly className="bg-[#f8fafc] text-[#667085]" />
        </Field>
        <Field id="product-timezone" label="Timezone" hint="Used for today’s forecast and draw dates.">
          <Select value={form.timezone} onValueChange={(value) => set('timezone', value)}>
            <SelectTrigger id="product-timezone">
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
        </Field>
        <Field id="product-min-age" label="Minimum age">
          <Input
            id="product-min-age"
            inputMode="numeric"
            value={form.minAge}
            onChange={(event) => set('minAge', event.target.value.replace(/[^\d]/g, '').slice(0, 2))}
            placeholder="18"
          />
        </Field>
      </Card>

      <Card title="Contact" hint="Used in the footer of subscriber email.">
        <Field id="support-email" label="Support email">
          <Input
            id="support-email"
            type="email"
            value={form.supportEmail}
            onChange={(event) => set('supportEmail', event.target.value)}
            placeholder="support@lottoforecasts.com"
          />
        </Field>
        <Field id="mailing-address" label="Mailing address" className="space-y-2 sm:col-span-2">
          <Textarea
            id="mailing-address"
            value={form.mailingAddress}
            onChange={(event) => set('mailingAddress', event.target.value)}
            placeholder="Street, city, state, ZIP"
            className="min-h-24"
          />
        </Field>
      </Card>

      <Card title="Site links" hint="Keep {token} in the verification and reset URLs.">
        <Field id="verify-email-url" label="Verify email" className="space-y-2 sm:col-span-2">
          <Input
            id="verify-email-url"
            value={form.verifyEmailUrl}
            onChange={(event) => set('verifyEmailUrl', event.target.value)}
            placeholder="https://www.lottoforecasts.com/verify-email?token={token}"
          />
        </Field>
        <Field id="reset-password-url" label="Reset password" className="space-y-2 sm:col-span-2">
          <Input
            id="reset-password-url"
            value={form.resetPasswordUrl}
            onChange={(event) => set('resetPasswordUrl', event.target.value)}
            placeholder="https://www.lottoforecasts.com/reset-password?token={token}"
          />
        </Field>
        <Field id="account-url" label="Account" className="space-y-2 sm:col-span-2">
          <Input
            id="account-url"
            value={form.accountUrl}
            onChange={(event) => set('accountUrl', event.target.value)}
            placeholder="https://www.lottoforecasts.com/account"
          />
        </Field>
      </Card>

      <Card title="Branding" hint="Accent used in product email.">
        <Field id="accent-color" label="Accent color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Pick accent color"
              value={/^#([0-9a-fA-F]{6})$/.test(form.accentColor) ? form.accentColor : '#0B3A82'}
              onChange={(event) => set('accentColor', event.target.value)}
              className="size-9 shrink-0 cursor-pointer rounded-lg border border-[#e4e7ec] bg-white p-1"
            />
            <Input
              id="accent-color"
              value={form.accentColor}
              onChange={(event) => set('accentColor', event.target.value)}
              placeholder="#0B3A82"
              className="font-mono uppercase"
            />
          </div>
        </Field>
      </Card>

      {form.fields.length > 0 ? (
        <Card title="Forecast fields" hint="Labels on banker, two sure, and the rest of the pick list.">
          <div className="sm:col-span-2">
            <div className="overflow-hidden rounded-lg border border-[#eef0f3]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#eef0f3] text-left text-[11px] font-medium tracking-wide text-[#98a2b3] uppercase">
                    <th className="px-3 py-2">Key</th>
                    <th className="px-3 py-2">Label</th>
                    <th className="px-3 py-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {form.fields.map((field, index) => (
                    <tr key={field.key} className="border-b border-[#eef0f3] last:border-0">
                      <td className="px-3 py-2 font-mono text-xs text-[#667085]">{field.key}</td>
                      <td className="px-3 py-2">
                        <Input
                          value={field.label}
                          aria-label={`${field.key} label`}
                          onChange={(event) => {
                            const next = [...form.fields];
                            next[index] = { ...field, label: event.target.value };
                            set('fields', next);
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 capitalize text-[#475467]">{field.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ) : null}
    </form>
  );
}
