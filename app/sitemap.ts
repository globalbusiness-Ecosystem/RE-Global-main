import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';

// The marketplace itself is one client-rendered page (language is a UI setting,
// not a URL), so only the real public routes are listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
