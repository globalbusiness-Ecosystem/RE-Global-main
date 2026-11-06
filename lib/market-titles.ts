import type { NavLanguage } from './nav-i18n';

// Property titles for the shares market, in the reader's language.
// The market stores the English title at the time of listing; the property itself carries the admin's translations.
export type MarketTitles = Record<string, Record<string, string>>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];
const MAX_TITLE = 200;

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim().slice(0, MAX_TITLE) : '');

/** From one property document: its title per language (translations first, then the Arabic title field). */
export function extractTitles(data: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!data) return out;
  const tr = data.translations && typeof data.translations === 'object' ? (data.translations as Record<string, unknown>) : {};
  for (const l of LANGS) {
    const entry = Object.prototype.hasOwnProperty.call(tr, l) ? (tr[l] as { title?: unknown } | undefined) : undefined;
    const t = clean(entry?.title);
    if (t) out[l] = t;
  }
  if (!out.ar) { const ar = clean(data.titleAr); if (ar) out.ar = ar; }
  return out;
}

/** The title to show: the property's title in this language, else the stored one. Safe against odd language codes and ids. */
export function pickMarketTitle(titles: MarketTitles | undefined, propertyId: string, language: string | undefined, fallback: string): string {
  if (!titles || !Object.prototype.hasOwnProperty.call(titles, propertyId)) return fallback;
  const byLang = titles[propertyId];
  const l = LANGS.find((x) => x === language);
  return l && Object.prototype.hasOwnProperty.call(byLang, l) && byLang[l] ? byLang[l] : fallback;
}
