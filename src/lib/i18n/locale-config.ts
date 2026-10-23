export const APP_PORT = 5173;

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${APP_PORT}`;

export function buildMetadataAlternates(path: string) {
  return {
    canonical: path,
  };
}
