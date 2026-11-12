import { z } from 'zod';

export const googleAuthBodySchema = z.object({
  idToken: z.string().trim().min(1, 'Google ID token is required.'),
  nonce: z.string().trim().min(1, 'Google nonce is required.'),
});

const consentVersion = z.string().trim().min(1).max(80);

export const socialCompleteBodySchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'Enter a valid country code.')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().max(40).optional(),
  consents: z
    .object({
      terms: consentVersion,
      privacy: consentVersion,
      age: consentVersion,
      sms: consentVersion.optional(),
      emailMarketing: consentVersion.optional(),
    })
    .strict(),
});

export function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isFutureIsoDate(value: string) {
  const today = new Date();
  const iso = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;
  return value > iso;
}

export function ageFromIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return 0;
  const born = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(born.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const month = today.getMonth() - born.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < born.getDate())) age -= 1;
  return age;
}
