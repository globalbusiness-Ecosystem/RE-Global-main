import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COUNTRIES } from '@/lib/legal-profiles';
import { listPublicListings } from '@/lib/public-listings-server';
import { countryFromSlug, listingTexts, seoLang } from '@/lib/public-listings';

export const revalidate = 300;
type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const c = countryFromSlug((await params).code);
  if (!c) return { title: 'Not found', robots: { index: false } };
  const lang = seoLang((await searchParams).lang);
  const name = COUNTRIES[c][lang];
  const slug = c.toLowerCase();
  const title = lang === 'ar' ? `عقارات في ${name} | RE` : `Properties in ${name} | RE`;
  return {
    title,
    description: lang === 'ar' ? `اتصفح العقارات المعروضة في ${name} وادفع بـ Pi.` : `Browse real estate listed in ${name} and pay with Pi.`,
    alternates: { canonical: `/country/${slug}`, languages: { en: `/country/${slug}`, ar: `/country/${slug}?lang=ar`, 'x-default': `/country/${slug}` } },
  };
}

export default async function CountryPage({ params, searchParams }: Props) {
  const c = countryFromSlug((await params).code);
  if (!c) notFound();
  const lang = seoLang((await searchParams).lang);
  const ar = lang === 'ar';
  const items = (await listPublicListings()).filter((l) => l.country === c);
  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        <h1 className="text-3xl font-bold">{ar ? `عقارات في ${COUNTRIES[c].ar}` : `Properties in ${COUNTRIES[c].en}`}</h1>
        {items.length === 0 && <p className="text-muted-foreground">{ar ? 'مفيش عقارات معروضة هنا دلوقتي.' : 'No listings here yet.'}</p>}
        <ul className="space-y-3">
          {items.map((l) => {
            const t = listingTexts(l, lang);
            return (
              <li key={l.id} className="border rounded-lg p-4">
                <a href={`/p/${l.id}${ar ? '?lang=ar' : ''}`} className="font-semibold underline">{t.title}</a>
                <p className="text-sm text-muted-foreground">{t.price}{t.place ? ` · ${t.place}` : ''}</p>
              </li>
            );
          })}
        </ul>
        <a href="/" className="underline">{ar ? 'افتح في التطبيق' : 'Open in the app'}</a>
      </div>
    </main>
  );
}
