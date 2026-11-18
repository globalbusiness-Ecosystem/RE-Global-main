import { siteUrl } from '@/lib/site-url';
import { getFounderCached } from '@/lib/founder-server';
import { ldString, siteJsonLd } from '@/lib/seo-site';

// Tells search engines who the platform is and who founded it (read from the admin's founder card).
export async function SiteJsonLd() {
  const f = await getFounderCached();
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldString(siteJsonLd(siteUrl(), f)) }} />;
}
