// Public base URL of the site, used for canonical links, sitemap and robots.
// Set NEXT_PUBLIC_BASE_URL to your own domain once you have one; until then the
// Vercel production URL (or the known deployment) is used.
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    'https://re-global-main.vercel.app';
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return u.origin;
  } catch {
    return 'https://re-global-main.vercel.app';
  }
}
