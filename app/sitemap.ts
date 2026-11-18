import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';
import { listPublicListings } from '@/lib/public-listings-server';
import { sitemapEntries } from '@/lib/sitemap-entries';

export const revalidate = 3600;

// The marketplace itself is one client-rendered page, so search engines are given
// real server-rendered pages: one per visible listing and one per country that has listings,
// each with links to its versions in every language.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  // The About page (founder and platform) is a real address search engines can read.
  return [{ url: `${base}/about`, changeFrequency: 'monthly', priority: 0.6 }, ...sitemapEntries(base, await listPublicListings())];
}
