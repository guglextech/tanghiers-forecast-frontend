'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { BrandLockup } from '@/components/brand/Logo';
import { useSession } from '@/components/app/SessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StepBars } from '@/components/auth/StepBars';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { shellClass } from '@/components/chrome/Chrome';
import { ApiError } from '@/lib/api/errors';
import { catalog } from '@/lib/api/resources';
import type { ApiConsentMap } from '@/lib/api/types';
import { clearPendingSocial, hasPendingSocialSignup, readPendingSocial } from '@/lib/google';
import { mfaPathFor, readPendingMfa } from '@/lib/mfa';
import { cn } from '@/lib/utils';

type Country = { code: string; name: string };
type ConsentField = 'terms' | 'privacy' | 'age' | 'sms' | 'emailMarketing';

const CONSENT_FIELDS: { kind: string; field: ConsentField; required: boolean }[] = [
  { kind: 'TERMS', field: 'terms', required: true },
  { kind: 'PRIVACY', field: 'privacy', required: true },
  { kind: 'AGE', field: 'age', required: true },
  { kind: 'SMS', field: 'sms', required: false },
  { kind: 'EMAIL_MARKETING', field: 'emailMarketing', required: false },
];

const NONE = 'none';
const STEPS = [{ title: 'Profile' }, { title: 'Agreements' }] as const;

function consentOf(map: ApiConsentMap, kind: string) {
  const match = Object.entries(map ?? {}).find(([key]) => key.toLowerCase() === kind.toLowerCase());
  const entry = match?.[1];
  return entry?.version ? entry : null;
}

export function RegistrationForm() {
  const { user, ready, completeGoogleSignup } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';
  const query = next ? `?next=${encodeURIComponent(next)}` : '';

  const [checking, setChecking] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [step, setStep] = React.useState(0);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [countryCode, setCountryCode] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [consents, setConsents] = React.useState<ApiConsentMap>({});
  const [accepted, setAccepted] = React.useState<Partial<Record<ConsentField, boolean>>>({});
  const [catalogueReady, setCatalogueReady] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!ready || !user) return;
    router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/feed');
  }, [ready, user, next, router]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const pending = await hasPendingSocialSignup();
      if (cancelled) return;
      if (!pending) {
        clearPendingSocial();
        router.replace(
          `/login${query ? `${query}&` : '?'}message=${encodeURIComponent('Continue with Google to finish registration.')}`,
        );
        return;
      }
      const profile = readPendingSocial();
      setEmail(profile?.email || '');
      setFirstName(profile?.firstName || '');
      setLastName(profile?.lastName || '');
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, query]);

  React.useEffect(() => {
    void Promise.all([
      catalog.countries().catch(() => [] as Country[]),
      catalog.consents().catch(() => ({}) as ApiConsentMap),
    ]).then(([countryRows, consentMap]) => {
      const list = (Array.isArray(countryRows) ? countryRows : [])
        .map((row) => ({ code: String(row.code || '').toUpperCase(), name: String(row.name || row.code || '') }))
        .filter((row) => /^[A-Z]{2}$/.test(row.code) && row.name);
      setCountries(list);
      setConsents(consentMap ?? {});
      setCatalogueReady(true);
    });
  }, []);

  const visibleConsents = CONSENT_FIELDS.flatMap((field) => {
    const entry = consentOf(consents, field.kind);
    return entry ? [{ ...field, version: entry.version, text: entry.text }] : [];
  });

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    for (const field of visibleConsents) {
      if (field.required && !accepted[field.field]) nextErrors[field.field] = 'This agreement is required.';
    }
    if (!visibleConsents.some((field) => field.field === 'terms' && field.required)) {
      nextErrors.form = 'The consent text could not be loaded. Refresh and try again.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    const chosen: Partial<Record<ConsentField, string>> = {};
    for (const field of visibleConsents) {
      if (accepted[field.field]) chosen[field.field] = field.version;
    }
    if (!chosen.terms || !chosen.privacy || !chosen.age) {
      setError('Agree to the terms, privacy policy, and age confirmation to continue.');
      return;
    }
    setBusy(true);
    try {
      const session = await completeGoogleSignup({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        countryCode: countryCode || undefined,
        phone: phone.trim() || undefined,
        consents: {
          terms: chosen.terms,
          privacy: chosen.privacy,
          age: chosen.age,
          ...(chosen.sms ? { sms: chosen.sms } : {}),
          ...(chosen.emailMarketing ? { emailMarketing: chosen.emailMarketing } : {}),
        },
      });
      toast.success('Registration complete.');
      if (next.startsWith('/') && !next.startsWith('//')) {
        router.replace(next);
      } else {
        router.replace(session.role === 'admin' ? '/admin' : '/feed');
      }
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'MFA_ENROLL' || err.code === 'MFA_VERIFY')) {
        router.replace(mfaPathFor(readPendingMfa(), next));
        return;
      }
      if (err instanceof ApiError && err.code === 'MISSING_SIGNUP_TOKEN') {
        router.replace(`/login${query ? `${query}&` : '?'}message=${encodeURIComponent(err.message)}`);
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not complete registration.');
      setBusy(false);
    }
  };

  if (checking || (ready && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <p className="text-sm text-[#667085]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header>
        <div className={cn(shellClass, 'flex h-12 items-center md:h-16')}>
          <BrandLockup />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <p className="text-[11px] font-medium tracking-[0.16em] text-[#98a2b3] uppercase">Google signup</p>
        <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight">
          {step === 0 ? 'Complete your profile' : 'Review agreements'}
        </h1>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          {step === 0 && email ? (
            <>
              Finish creating the account for <span className="font-medium text-[#101828]">{email}</span>.
            </>
          ) : step === 0 ? (
            'Add any optional profile details.'
          ) : (
            'Required agreements must be accepted to create your account.'
          )}
        </p>

        <StepBars
          label="Google signup progress"
          steps={STEPS}
          current={step}
          onSelect={(index) => {
            setError('');
            setFieldErrors({});
            setStep(index);
          }}
        />

        <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-4" noValidate>
          {step === 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    maxLength={100}
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
                    maxLength={100}
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryCode">Country (optional)</Label>
                <Select
                  value={countryCode || NONE}
                  onValueChange={(value) => setCountryCode(value === NONE ? '' : value)}
                >
                  <SelectTrigger id="countryCode">
                    <SelectValue placeholder="Not specified" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Not specified</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 415 555 0100"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-[#e6e8ee]">
                {visibleConsents.length === 0 ? (
                  <p className="px-4 py-3.5 text-sm text-[#667085]">
                    {catalogueReady ? 'Consent text is unavailable. Refresh and try again.' : 'Loading agreements…'}
                  </p>
                ) : (
                  visibleConsents.map((field, index) => (
                    <div key={field.field} className={index > 0 ? 'border-t border-[#eef0f3]' : ''}>
                      <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                        <Label
                          htmlFor={`consent-${field.field}`}
                          className="text-sm font-normal leading-5 text-[#344054]"
                        >
                          {field.text}
                          {field.required ? null : <span className="text-[#98a2b3]"> (optional)</span>}
                        </Label>
                        <Switch
                          id={`consent-${field.field}`}
                          size="sm"
                          checked={Boolean(accepted[field.field])}
                          onCheckedChange={(value) =>
                            setAccepted((current) => ({ ...current, [field.field]: value }))
                          }
                          className="shadow-none"
                        />
                      </div>
                      {fieldErrors[field.field] ? (
                        <p className="px-4 pb-3 text-xs text-destructive">{fieldErrors[field.field]}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              {fieldErrors.form ? <p className="text-sm text-destructive">{fieldErrors.form}</p> : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setError('');
                  setFieldErrors({});
                  setStep(0);
                }}
              >
                Back
              </Button>
            ) : null}

            {step === 0 ? (
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  setError('');
                  setFieldErrors({});
                  setStep(1);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" className="flex-1" loading={busy} disabled={!catalogueReady}>
                {busy ? 'Creating account' : 'Create account'}
              </Button>
            )}
          </div>
        </form>

        <p className="mt-6 text-sm text-[#667085]">
          Wrong account?{' '}
          <Link href={`/login${query}`} className="font-medium text-[#101828] hover:underline">
            Back to log in
          </Link>
        </p>
      </main>
    </div>
  );
}
