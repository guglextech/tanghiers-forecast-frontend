export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://tanghiers-forecast-api.onrender.com';

/** Matches Postman `{{productSlug}}`. Override with NEXT_PUBLIC_PRODUCT_SLUG. */
export const PRODUCT_SLUG = process.env.NEXT_PUBLIC_PRODUCT_SLUG ?? 'tanghiers-forecast';

export const AUTH_STORAGE_KEY = 'tg.auth.v1';

type QueryValue = string | number | boolean | null | undefined;

export function productQuery(
  extra: Record<string, QueryValue> = {},
  productSlug: string = PRODUCT_SLUG,
) {
  const params = new URLSearchParams();
  params.set('productSlug', extra.productSlug != null && extra.productSlug !== ''
    ? String(extra.productSlug)
    : productSlug);
  for (const [key, value] of Object.entries(extra)) {
    if (key === 'productSlug' || value == null || value === '') continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export function productUrl(
  path: string,
  extra: Record<string, QueryValue> = {},
  productSlug: string = PRODUCT_SLUG,
) {
  return `${path}?${productQuery(extra, productSlug)}`;
}

export function productResource(base: string, productSlug: string = PRODUCT_SLUG) {
  return `${base}/${encodeURIComponent(productSlug)}`;
}

export function productBody<T extends Record<string, unknown>>(
  body: T,
  productSlug: string = PRODUCT_SLUG,
): T & { productSlug: string } {
  const existing = body.productSlug;
  return {
    ...body,
    productSlug: typeof existing === 'string' && existing ? existing : productSlug,
  };
}
