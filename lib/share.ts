import { isSeoLang } from './seo-i18n';

/** The public page of a listing, in the visitor's language (English is the default, so it needs no ?lang). */
export function shareUrl(origin: string, id: string, lang?: string): string {
  const base = `${origin.replace(/\/+$/, '')}/p/${encodeURIComponent(id)}`;
  return isSeoLang(lang) && lang !== 'en' ? `${base}?lang=${lang}` : base;
}

/** The same link without the site name, for the "open the public page" link inside the app. */
export function sharePath(id: string, lang?: string): string {
  return shareUrl('', id, lang);
}
