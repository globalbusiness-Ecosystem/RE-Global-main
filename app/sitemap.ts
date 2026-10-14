import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';
import { COUNTRIES } from '@/lib/legal-profiles';
import { listPublicListings } from '@/lib/public-listings-server';

export const revalidate = 3600;

// The marketplace itself is one client-rendered page, so search engines are given
// real server-rendered pages: one per visible listing and one per country that has listings.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const listings = await listPublicListings();
  const countries = [...new Set(listings.map((l) => l.country).filter((c) => c in COUNTRIES))];
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    ...countries.map((c) => ({ url: `${base}/country/${c.toLowerCase()}`, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...listings.map((l) => ({ url: `${base}/p/${l.id}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
