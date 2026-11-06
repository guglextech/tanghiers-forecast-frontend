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
import { ageFromIso } from '@/lib/auth/validation';
import { clearPendingSocial, hasPendingSocialSignup, readPendingSocial } from '@/lib/google';
import { mfaPathFor, readPendingMfa } from '@/lib/mfa';
import { cn } from '@/lib/utils';

type Country = { code: string; name: string };

function consentOf(map: ApiConsentMap, keys: string[]) {
  const entries = Object.entries(map ?? {});
  for (const want of keys) {
    const match = entries.find(([key]) => key.toLowerCase() === want.toLowerCase());
    const entry = match?.[1];
    if (entry?.version) return entry;
  }
  return null;
}

function ConsentRow({
  id,
  checked,
  onChange,
  text,
  href,
  linkLabel,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  text: string;
  href?: string;
  linkLabel?: string;
  error?: string;
}) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Label htmlFor={id} className="text-sm font-normal leading-5 text-[#344054]">
            {text}
          </Label>
          {href && linkLabel ? (
            <Link href={href} className="mt-1 block text-xs font-medium text-[#667085] hover:text-[#101828]">
              {linkLabel}
            </Link>
          ) : null}
        </div>
        <Switch id={id} size="sm" checked={checked} onCheckedChange={onChange} className="shadow-none" />
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function RegistrationForm() {
  const { user, ready, completeGoogleSignup } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';
  const query = next ? `?next=${encodeURIComponent(next)}` : '';

  const [checking, setChecking] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [countryCode, setCountryCode] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [agreePrivacy, setAgreePrivacy] = React.useState(false);
  const [agreeAge, setAgreeAge] = React.useState(false);
  const [consents, setConsents] = React.useState<ApiConsentMap>({});
  const [minAge, setMinAge] = React.useState<number | null>(null);
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
        router.replace(`/login${query ? `${query}&` : '?'}message=${encodeURIComponent('Continue with Google to finish registration.')}`);
        return;
      }
      const profile = readPendingSocial();
      setEmail(profile?.email || '');
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
      catalog.product().catch(() => null),
    ]).then(([countryRows, consentMap, product]) => {
      const list = (Array.isArray(countryRows) ? countryRows : [])
        .map((row) => ({ code: String(row.code || '').toUpperCase(), name: String(row.name || row.code || '') }))
        .filter((row) => /^[A-Z]{2}$/.test(row.code) && row.name);
      setCountries(list);
      setConsents(consentMap ?? {});
      if (product?.minAge && product.minAge > 0) setMinAge(product.minAge);
      setCountryCode((current) => {
        if (current) return current;
        const locale = typeof navigator !== 'undefined' ? navigator.language : '';
        const guess = locale.split('-')[1]?.toUpperCase() || '';
        const match = guess ? list.find((row) => row.code === guess) : undefined;
        return match ? match.code : '';
      });
    });
  }, []);

  const terms = consentOf(consents, ['terms', 'TERMS']) ?? {
    version: 'terms-2026-10',
    text: 'I agree to the Terms and Conditions.',
  };
  const privacy = consentOf(consents, ['privacy', 'PRIVACY']) ?? {
    version: 'privacy-2026-10',
    text: 'I agree to the Privacy Policy.',
  };
  const age = consentOf(consents, ['age', 'AGE']) ?? {
    version: 'age-2026-10',
    text: minAge ? `I confirm I am at least ${minAge} years old.` : 'I confirm that I meet the age requirement.',
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!/^[A-Z]{2}$/.test(countryCode)) nextErrors.countryCode = 'Choose a country.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      nextErrors.dateOfBirth = 'Enter your date of birth.';
    } else {
      const today = new Date();
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (dateOfBirth > iso) nextErrors.dateOfBirth = 'Date of birth cannot be in the future.';
      else if (minAge && ageFromIso(dateOfBirth) < minAge) {
        nextErrors.dateOfBirth = `You must be at least ${minAge} years old.`;
      }
    }
    if (!agreeTerms) nextErrors.agreeTerms = 'Agree to the Terms and Conditions.';
    if (!agreePrivacy) nextErrors.agreePrivacy = 'Agree to the Privacy Policy.';
    if (!agreeAge) nextErrors.agreeAge = 'Confirm that you meet the age requirement.';
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const session = await completeGoogleSignup({
        countryCode,
        dateOfBirth,
        acceptedTerms: agreeTerms,
        acceptedPrivacy: agreePrivacy,
        acceptedAge: agreeAge,
        ...(minAge ? { minAge } : {}),
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
        <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight">Complete registration</h1>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          {email ? `Finish setting up ${email}.` : 'Finish setting up your Google account.'}
        </p>

        <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="countryCode">Country</Label>
            <Select value={countryCode || undefined} onValueChange={setCountryCode}>
              <SelectTrigger id="countryCode" aria-invalid={Boolean(fieldErrors.countryCode)}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.countryCode ? <p className="text-xs text-destructive">{fieldErrors.countryCode}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              required
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              aria-invalid={Boolean(fieldErrors.dateOfBirth)}
            />
            {fieldErrors.dateOfBirth ? <p className="text-xs text-destructive">{fieldErrors.dateOfBirth}</p> : null}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e6e8ee]">
            <ConsentRow
              id="agree-terms"
              checked={agreeTerms}
              onChange={setAgreeTerms}
              text={terms.text}
              href="/terms"
              linkLabel="Read terms"
              error={fieldErrors.agreeTerms}
            />
            <div className="h-px bg-[#eef0f3]" />
            <ConsentRow
              id="agree-privacy"
              checked={agreePrivacy}
              onChange={setAgreePrivacy}
              text={privacy.text}
              href="/privacy"
              linkLabel="Read privacy"
              error={fieldErrors.agreePrivacy}
            />
            <div className="h-px bg-[#eef0f3]" />
            <ConsentRow
              id="agree-age"
              checked={agreeAge}
              onChange={setAgreeAge}
              text={age.text}
              error={fieldErrors.agreeAge}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" loading={busy}>
            {busy ? 'Completing registration' : 'Complete Registration'}
          </Button>
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
