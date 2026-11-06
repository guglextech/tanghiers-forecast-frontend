/** Server-only Tanghiers auth configuration. Do not import from client components. */

export function apiBaseUrl() {
  return (
    process.env.TANGHIERS_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'https://tanghiers-forecast-api.onrender.com'
  );
}

export function productSlug() {
  return (
    process.env.TANGHIERS_PRODUCT_SLUG?.trim() ||
    process.env.NEXT_PUBLIC_PRODUCT_SLUG?.trim() ||
    'tanghiers-forecast'
  );
}

export function consentVersions() {
  return {
    terms: process.env.TANGHIERS_TERMS_VERSION?.trim() || 'terms-2026-10',
    privacy: process.env.TANGHIERS_PRIVACY_VERSION?.trim() || 'privacy-2026-10',
    age: process.env.TANGHIERS_AGE_VERSION?.trim() || 'age-2026-10',
  };
}
