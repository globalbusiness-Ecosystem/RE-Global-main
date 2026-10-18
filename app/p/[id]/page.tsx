import Link from "next/link";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteUrl } from '@/lib/site-url';
import { COUNTRIES } from '@/lib/legal-profiles';
import { getPublicListing } from '@/lib/public-listings-server';
import { listingJsonLd, listingTexts, seoLang } from '@/lib/public-listings';
import { ReportListing } from '@/components/report-listing';

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
      languages: { en: `/p/${id}`, ar: `/p/${id}?lang=ar`, 'x-default': `/p/${id}` },
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
  const ar = lang === 'ar';
  const ld = JSON.stringify(listingJsonLd(l, siteUrl(), lang)).replace(/</g, '\\u003c');
  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        {l.image && <img src={l.image} alt={t.title} className="w-full rounded-xl object-cover max-h-96" />}
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-xl text-accent">{t.price}{l.sold ? (ar ? ' — اتباع' : ' — Sold') : ''}</p>
        {t.place && <p>{t.place}</p>}
        {t.facts && <p className="text-muted-foreground">{t.facts}</p>}
        {t.body && <p>{t.body}</p>}
        <p className="flex gap-4 pt-4">
          <Link href="/" className="underline">{ar ? 'افتح في التطبيق' : 'Open in the app'}</Link>
          {l.country && <Link href={`/country/${l.country.toLowerCase()}${ar ? '?lang=ar' : ''}`} className="underline">{COUNTRIES[l.country]?.[lang]}</Link>}
          <Link href={`/p/${id}${ar ? '' : '?lang=ar'}`} className="underline">{ar ? 'English' : 'العربية'}</Link>
        </p>
        <ReportListing id={id} />
      </div>
    </main>
  );
}
