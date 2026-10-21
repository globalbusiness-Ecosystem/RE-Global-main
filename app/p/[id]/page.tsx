import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteUrl } from '@/lib/site-url';
import { COUNTRIES } from '@/lib/legal-profiles';
import { getPublicListing } from '@/lib/public-listings-server';
import { listingJsonLd, listingTexts, seoLang } from '@/lib/public-listings';
import { reviewCount } from '@/lib/stay-reviews';
import { ReportListing } from '@/components/report-listing';
import { SeoLangSwitch } from '@/components/seo-lang-switch';
import { SEO_I18N, countryName, isRtl, seoAlternates } from '@/lib/seo-i18n';
import { osmLink } from '@/lib/geocode';

export const revalidate = 300;
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const lang = seoLang((await searchParams).lang);
  const l = await getPublicListing(id);
  if (!l) return { title: 'Property not found', robots: { index: false } };
  const t = listingTexts(l, lang);
  return {
    title: `${t.title} | RE`,
    description: t.description,
    alternates: {
      canonical: `/p/${id}`,
      languages: seoAlternates(`/p/${id}`),
    },
    openGraph: { title: t.title, description: t.description, type: 'website', url: `/p/${id}`, ...(l.image ? { images: [l.image] } : {}) },
    twitter: { card: l.image ? 'summary_large_image' : 'summary', title: t.title, description: t.description },
  };
}

export default async function PropertyPublicPage({ params, searchParams }: Props) {
  const { id } = await params;
  const lang = seoLang((await searchParams).lang);
  const l = await getPublicListing(id);
  if (!l) notFound();
  const t = listingTexts(l, lang);
  const S = SEO_I18N[lang];
  const map = l.lat !== undefined && l.lng !== undefined ? osmLink(l.lat, l.lng) : null;
  const ld = JSON.stringify(listingJsonLd(l, siteUrl(), lang)).replace(/</g, '\\u003c');
  return (
    <main dir={isRtl(lang) ? 'rtl' : 'ltr'} lang={lang} className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        {l.image && <img src={l.image} alt={t.title} className="w-full rounded-xl object-cover max-h-96" />}
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-xl text-accent">{t.price}{l.sold ? ` — ${S.sold}` : ''}</p>
        {l.ratingValue && l.ratingCount ? <p className="text-sm"><span className="text-yellow-500" aria-hidden>★</span> <strong>{l.ratingValue.toFixed(1)}</strong> / 5 · {reviewCount(lang, l.ratingCount)}</p> : null}
        {t.place && <p>{t.place}</p>}
        {t.facts && <p className="text-muted-foreground">{t.facts}</p>}
        {t.body && <p>{t.body}</p>}
        <p className="flex flex-wrap gap-4 pt-4">
          <a href="/" className="underline">{S.openApp}</a>
          {map && <a href={map} target="_blank" rel="noopener noreferrer" className="underline">{S.viewOnMap}</a>}
          {l.country && <a href={`/country/${l.country.toLowerCase()}${lang === 'en' ? '' : `?lang=${lang}`}`} className="underline">{countryName(l.country, lang, COUNTRIES[l.country]?.en ?? '')}</a>}
        </p>
        <SeoLangSwitch path={`/p/${id}`} current={lang} />
        <ReportListing id={id} />
      </div>
    </main>
  );
}
