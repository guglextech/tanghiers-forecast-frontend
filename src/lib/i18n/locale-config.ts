export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function buildMetadataAlternates(path: string) {
  return {
    canonical: path,
  };
}
