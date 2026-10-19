import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COUNTRIES } from '@/lib/legal-profiles';
import { listPublicListings } from '@/lib/public-listings-server';
import { countryFromSlug, listingTexts, seoLang } from '@/lib/public-listings';
import { SeoLangSwitch } from '@/components/seo-lang-switch';
import { SEO_I18N, countryName, isRtl, seoAlternates } from '@/lib/seo-i18n';

export const revalidate = 300;
type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const c = countryFromSlug((await params).code);
  if (!c) return { title: 'Not found', robots: { index: false } };
  const lang = seoLang((await searchParams).lang);
  const name = countryName(c, lang, COUNTRIES[c].en);
  const slug = c.toLowerCase();
  return {
    title: `${SEO_I18N[lang].propertiesIn(name)} | RE`,
    description: SEO_I18N[lang].browse(name),
    alternates: { canonical: `/country/${slug}`, languages: seoAlternates(`/country/${slug}`) },
  };
}

export default async function CountryPage({ params, searchParams }: Props) {
  const c = countryFromSlug((await params).code);
  if (!c) notFound();
  const lang = seoLang((await searchParams).lang);
  const S = SEO_I18N[lang];
  const q = lang === 'en' ? '' : `?lang=${lang}`;
  const items = (await listPublicListings()).filter((l) => l.country === c);
  return (
    <main dir={isRtl(lang) ? 'rtl' : 'ltr'} lang={lang} className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        <h1 className="text-3xl font-bold">{S.propertiesIn(countryName(c, lang, COUNTRIES[c].en))}</h1>
        {items.length === 0 && <p className="text-muted-foreground">{S.noListings}</p>}
        <ul className="space-y-3">
          {items.map((l) => {
            const t = listingTexts(l, lang);
            return (
              <li key={l.id} className="border rounded-lg p-4">
                <a href={`/p/${l.id}${q}`} className="font-semibold underline">{t.title}</a>
                <p className="text-sm text-muted-foreground">{t.price}{t.place ? ` · ${t.place}` : ''}</p>
              </li>
            );
          })}
        </ul>
        <a href="/" className="underline">{S.openApp}</a>
        <SeoLangSwitch path={`/country/${c.toLowerCase()}`} current={lang} />
      </div>
    </main>
  );
}
