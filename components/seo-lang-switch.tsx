import { SEO_LANGS, LANG_NAMES, type SeoLang } from '@/lib/seo-i18n';

// Plain links to the same page in every language (crawlable, no JavaScript needed).
export function SeoLangSwitch({ path, current }: { path: string; current: SeoLang }) {
  return (
    <nav aria-label="Language" className="flex flex-wrap gap-3 pt-2 text-sm">
      {SEO_LANGS.map((l) =>
        l === current ? (
          <span key={l} className="font-semibold" aria-current="true">{LANG_NAMES[l]}</span>
        ) : (
          <a key={l} href={l === 'en' ? path : `${path}?lang=${l}`} hrefLang={l} lang={l} className="underline">{LANG_NAMES[l]}</a>
        ),
      )}
    </nav>
  );
}
