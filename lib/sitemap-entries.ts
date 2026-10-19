import type { MetadataRoute } from 'next';
import { COUNTRIES } from '@/lib/legal-profiles';
import { SEO_LANGS } from '@/lib/seo-i18n';
import type { PublicListing } from '@/lib/public-listings';

/** Every language version of a public page, as absolute links (what search engines read as hreflang). */
export function languageLinks(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of SEO_LANGS) out[l] = l === 'en' ? url : `${url}?lang=${l}`;
  out['x-default'] = url;
  return out;
}

/** A valid date from an ISO string, or undefined (the sitemap then simply has no lastModified). */
export function validDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function sitemapEntries(base: string, listings: PublicListing[]): MetadataRoute.Sitemap {
  const countries = [...new Set(listings.map((l) => l.country).filter((c) => c in COUNTRIES))];
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    ...countries.map((c) => {
      const url = `${base}/country/${c.toLowerCase()}`;
      return { url, changeFrequency: 'daily' as const, priority: 0.8, alternates: { languages: languageLinks(url) } };
    }),
    ...listings.map((l) => {
      const url = `${base}/p/${l.id}`;
      const lastModified = validDate(l.updatedAt);
      return { url, changeFrequency: 'weekly' as const, priority: 0.7, ...(lastModified ? { lastModified } : {}), alternates: { languages: languageLinks(url) } };
    }),
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
