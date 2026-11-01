'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLockup } from '@/components/brand/Logo';
import { GoogleContinueButton } from '@/components/auth/GoogleContinueButton';
import { useSession } from '@/components/app/SessionProvider';
import { ApiError } from '@/lib/api/errors';
import { readPendingSocial } from '@/lib/google';
import { mfaPathFor, readPendingMfa } from '@/lib/mfa';
import { catalog } from '@/lib/api/resources';
import type { ApiConsentMap } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StepBars } from '@/components/auth/StepBars';
import { shellClass } from '@/components/chrome/Chrome';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 0, title: 'Account' },
  { id: 1, title: 'Consent' },
] as const;

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
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  text: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-normal leading-5 text-[#344054]">
          {text}
        </Label>
        {href && linkLabel ? (
          <Link
            href={href}
            className="mt-1 block text-xs font-medium text-[#667085] hover:text-[#101828]"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <Switch id={id} size="sm" checked={checked} onCheckedChange={onChange} className="shadow-none" />
    </div>
  );
}

function ageFromIso(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return 0;
  const born = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(born.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const month = today.getMonth() - born.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < born.getDate())) age -= 1;
  return age;
}

const CONSENT_NOTE = 'Agree to the terms, privacy policy, and age confirmation to continue.';

const STEP_COPY = [
  { title: 'Join Tanghiers', hint: 'Continue with Google, or use email and a password.' },
  { title: 'Almost done', hint: '' },
] as const;

export function SignupScreen() {
  const { user, ready, signup, continueWithGoogle, completeGoogleSignup } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';
  const query = next ? `?next=${encodeURIComponent(next)}` : '';

  const [step, setStep] = React.useState(0);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [agreePrivacy, setAgreePrivacy] = React.useState(false);
  const [agreeAge, setAgreeAge] = React.useState(false);
  const [consents, setConsents] = React.useState<ApiConsentMap>({});
  const [minAge, setMinAge] = React.useState(18);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [pendingSocial, setPendingSocial] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!ready || !user) return;
    router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/pricing');
  }, [ready, user, next, router]);

  React.useEffect(() => {
    const pending = readPendingSocial();
    if (!pending?.signupToken) return;
    setPendingSocial(pending.email || 'your Google account');
    setStep(1);
  }, []);

  React.useEffect(() => {
    void Promise.all([
      catalog.consents().catch(() => ({}) as ApiConsentMap),
      catalog.product().catch(() => null),
    ]).then(([consentMap, product]) => {
      setConsents(consentMap ?? {});
      if (product?.minAge) setMinAge(product.minAge);
    });
  }, []);

  const terms = consentOf(consents, ['terms', 'TERMS']) ?? {
    version: 'terms-2026-10',
    text: 'I agree to the Tanghiers Terms of Service.',
  };
  const privacy = consentOf(consents, ['privacy', 'PRIVACY']) ?? {
    version: 'privacy-2026-10',
    text: 'I agree to the Tanghiers Privacy Policy.',
  };
  const age = consentOf(consents, ['age', 'AGE']) ?? {
    version: 'age-2026-10',
    text: `I confirm I am at least ${minAge} years old.`,
  };

  const onGoogle = async (idToken: string) => {
    setError('');
    try {
      await continueWithGoogle(idToken);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SOCIAL_SIGNUP') {
        const pending = readPendingSocial();
        setPendingSocial(pending?.email || 'your Google account');
        setStep(1);
        return;
      }
      if (err instanceof ApiError && (err.code === 'MFA_ENROLL' || err.code === 'MFA_VERIFY')) {
        router.replace(mfaPathFor(readPendingMfa(), next));
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not continue with Google.');
    }
  };

  const validateStep = (index: number) => {
    if (index === 0 && !pendingSocial) {
      if (!firstName.trim()) throw new Error('Enter a first name.');
      if (!lastName.trim()) throw new Error('Enter a last name.');
      if (!email.trim()) throw new Error('Enter an email.');
      if (password.length < 8) throw new Error('Use a password of at least 8 characters.');
    }
    if (index === 1) {
      if (pendingSocial && !dateOfBirth) throw new Error('Enter your date of birth.');
      if (pendingSocial && ageFromIso(dateOfBirth) < minAge) {
        throw new Error(`You must be at least ${minAge} years old.`);
      }
      if (!agreeTerms || !agreePrivacy || !agreeAge) {
        throw new Error(CONSENT_NOTE);
      }
    }
  };

  const goNext = () => {
    setError('');
    try {
      validateStep(step);
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check this step and try again.');
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      validateStep(0);
      validateStep(1);
      setBusy(true);
      const versions = { terms: terms.version, privacy: privacy.version, age: age.version };
      if (pendingSocial) {
        await completeGoogleSignup({ consents: versions, dateOfBirth });
        toast.success('Signed in with Google.');
        return;
      }
      await signup({
        email,
        password,
        firstName,
        lastName,
        consents: versions,
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'PENDING_VERIFICATION') {
        setDone(true);
        toast.success(err.message);
        return;
      }
      if (err instanceof ApiError && (err.code === 'MFA_ENROLL' || err.code === 'MFA_VERIFY')) {
        router.replace(mfaPathFor(readPendingMfa(), next));
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not create that account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header>
        <div className={cn(shellClass, 'flex h-12 items-center md:h-16')}>
          <BrandLockup />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        {done ? (
          <>
            <p className="text-[11px] font-medium tracking-[0.16em] text-[#98a2b3] uppercase">Almost there</p>
            <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight">Check your email</h1>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              If {email || 'that address'} can be used, a verification message is on its way.
            </p>
            <Button asChild className="mt-8 w-full" size="sm">
              <Link href={`/login${query}`}>Log in</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-[11px] font-medium tracking-[0.16em] text-[#98a2b3] uppercase">Create account</p>
            <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight">
              {pendingSocial && step === 1 ? 'Finish with Google' : STEP_COPY[step].title}
            </h1>
            {pendingSocial && step === 1 ? (
              <p className="mt-1 text-sm leading-6 text-[#667085]">
                Agree to continue as {pendingSocial}.
              </p>
            ) : STEP_COPY[step].hint ? (
              <p className="mt-1 text-sm leading-6 text-[#667085]">{STEP_COPY[step].hint}</p>
            ) : null}

            <StepBars
              label="Signup progress"
              steps={STEPS}
              current={step}
              onSelect={(index) => {
                setError('');
                setStep(index);
              }}
            />

            <form onSubmit={submit} className="mt-8 space-y-4">
              {step === 0 ? (
                <>
                  <GoogleContinueButton
                    onSuccess={(idToken) => void onGoogle(idToken)}
                    onError={setError}
                  />
                  <p className="text-center text-xs text-[#98a2b3]">or with email</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="pr-9"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 grid w-9 place-items-center text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((open) => !open)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" strokeWidth={1.75} />
                        ) : (
                          <Eye className="size-4" strokeWidth={1.75} />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  {pendingSocial ? (
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(event) => setDateOfBirth(event.target.value)}
                      />
                    </div>
                  ) : null}
                  <div className="overflow-hidden rounded-2xl border border-[#e6e8ee]">
                    <ConsentRow
                      id="agree-terms"
                      checked={agreeTerms}
                      onChange={setAgreeTerms}
                      text={terms.text}
                      href="/terms"
                      linkLabel="Read terms"
                    />
                    <div className="h-px bg-[#eef0f3]" />
                    <ConsentRow
                      id="agree-privacy"
                      checked={agreePrivacy}
                      onChange={setAgreePrivacy}
                      text={privacy.text}
                      href="/privacy"
                      linkLabel="Read privacy"
                    />
                    <div className="h-px bg-[#eef0f3]" />
                    <ConsentRow
                      id="agree-age"
                      checked={agreeAge}
                      onChange={setAgreeAge}
                      text={age.text}
                    />
                  </div>
                </>
              ) : null}

              {step === 1 ? (
                <p className={cn('text-xs leading-5', error === CONSENT_NOTE ? 'text-destructive' : 'text-[#98a2b3]')}>
                  Agree to the{' '}
                  <Link href="/terms" className="font-medium text-[#667085] hover:underline">
                    terms
                  </Link>
                  ,{' '}
                  <Link href="/privacy" className="font-medium text-[#667085] hover:underline">
                    privacy policy
                  </Link>
                  , and age confirmation to continue.
                </p>
              ) : null}

              {error && error !== CONSENT_NOTE ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex items-center gap-3 pt-1">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setError('');
                      setStep((current) => current - 1);
                    }}
                  >
                    Back
                  </Button>
                ) : null}
                {step < STEPS.length - 1 ? (
                  <Button type="button" className="flex-1" onClick={goNext}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1" loading={busy}>
                    {busy
                      ? pendingSocial
                        ? 'Finishing'
                        : 'Creating account'
                      : pendingSocial
                        ? 'Finish signup'
                        : 'Create account'}
                  </Button>
                )}
              </div>
            </form>
          </>
        )}

        {!done ? (
          <p className="mt-6 text-sm text-[#667085]">
            Already have an account?{' '}
            <Link href={`/login${query}`} className="font-medium text-[#101828] hover:underline">
              Log in
            </Link>
          </p>
        ) : null}
      </main>
    </div>
  );
}

