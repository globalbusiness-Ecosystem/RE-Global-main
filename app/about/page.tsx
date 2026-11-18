import type { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/site-url';
import { getFounderCached } from '@/lib/founder-server';
import { founderVisible } from '@/lib/founder';
import { ORG_NAME, aboutJsonLd, ldString } from '@/lib/seo-site';
import { SEO_I18N, isRtl, seoAlternates, seoLang } from '@/lib/seo-i18n';
import { ABOUT_I18N } from '@/lib/about-i18n';
import { FOUNDER_UI, founderText } from '@/lib/founder-i18n';
import { pickText } from '@/lib/home-features';
import { SeoLangSwitch } from '@/components/seo-lang-switch';

export const revalidate = 3600;
type Props = { searchParams: Promise<{ lang?: string }> };

// A real, server-rendered page about the platform and its founder, so a search engine or a link preview that opens the
// address finds the founder's name, photo and role next to the platform's name.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = seoLang((await searchParams).lang);
  const f = await getFounderCached();
  const named = founderVisible(f);
  const role = f.role ? pickText(f.role, lang) : '';
  const title = named ? `${f.name} — ${founderText(FOUNDER_UI.chip, lang)} | ${ORG_NAME}` : `${ABOUT_I18N[lang].heroTitle} | ${ORG_NAME}`;
  const description = named ? [role, ABOUT_I18N[lang].heroSubtitle].filter(Boolean).join(' · ') : ABOUT_I18N[lang].heroSubtitle;
  const images = named && f.photoUrl ? [f.photoUrl] : ['/icon-512.png'];
  return {
    title,
    description,
    alternates: { canonical: '/about', languages: seoAlternates('/about') },
    openGraph: { title, description, type: named ? 'profile' : 'website', url: '/about', images },
    twitter: { card: 'summary', title, description, images },
  };
}

export default async function PublicAboutPage({ searchParams }: Props) {
  const lang = seoLang((await searchParams).lang);
  const f = await getFounderCached();
  const A = ABOUT_I18N[lang];
  const S = SEO_I18N[lang];
  const named = founderVisible(f);
  const role = f.role ? pickText(f.role, lang) : '';
  const bio = f.bio ? pickText(f.bio, lang) : '';
  return (
    <main dir={isRtl(lang) ? 'rtl' : 'ltr'} lang={lang} className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldString(aboutJsonLd(siteUrl(), f, [role, A.heroSubtitle].filter(Boolean).join(' · '))) }} />
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
        <h1 className="text-3xl font-bold text-accent">{ORG_NAME}</h1>
        <p className="text-lg text-muted-foreground">{A.heroSubtitle}</p>
        <section>
          <h2 className="mb-2 text-xl font-bold">{A.missionTitle}</h2>
          <p className="leading-relaxed text-muted-foreground">{A.missionBody}</p>
        </section>
        {named && (
          <section aria-label={founderText(FOUNDER_UI.title, lang)}>
            <h2 className="mb-3 text-xl font-bold">{founderText(FOUNDER_UI.title, lang)}</h2>
            <div className="flex items-center gap-4">
              {f.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.photoUrl} alt={f.name ?? ''} className="h-24 w-24 rounded-full border-2 border-[#d4af37] object-cover" />
              )}
              <div>
                <h3 className="text-lg font-bold">{f.name}</h3>
                <p className="text-sm font-semibold text-[#d4af37]">{founderText(FOUNDER_UI.chip, lang)}{role ? ` · ${role}` : ''}</p>
              </div>
            </div>
            {bio && <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{bio}</p>}
            <p className="mt-3 flex flex-wrap gap-4 text-sm">
              {f.linkedin && <a href={f.linkedin} target="_blank" rel="me noopener noreferrer" className="underline">{founderText(FOUNDER_UI.linkedin, lang)}</a>}
              {f.website && <a href={f.website} target="_blank" rel="me noopener noreferrer" className="underline">{founderText(FOUNDER_UI.website, lang)}</a>}
            </p>
          </section>
        )}
        <p className="pt-2"><Link href="/" className="underline">{S.openApp}</Link></p>
        <SeoLangSwitch path="/about" current={lang} />
      </div>
    </main>
  );
}
