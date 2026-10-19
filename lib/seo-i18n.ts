// Texts for the public, search-engine facing pages (listing and country pages) in the 7 app languages.
export const SEO_LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
export type SeoLang = (typeof SEO_LANGS)[number];

export const isSeoLang = (v: unknown): v is SeoLang => typeof v === 'string' && (SEO_LANGS as readonly string[]).includes(v);
export const seoLang = (v: unknown): SeoLang => (isSeoLang(v) ? v : 'en');
export const isRtl = (l: SeoLang) => l === 'ar' || l === 'ur';

export const LANG_NAMES: Record<SeoLang, string> = { en: 'English', ar: 'العربية', fr: 'Français', es: 'Español', pt: 'Português', ur: 'اردو', zh: '中文' };

export type SeoStrings = {
  bed: string; bath: string; sold: string; openApp: string; viewOnMap: string;
  propertiesIn: (country: string) => string;
  browse: (country: string) => string;
  noListings: string;
};

export const SEO_I18N: Record<SeoLang, SeoStrings> = {
  en: { bed: 'bed', bath: 'bath', sold: 'Sold', openApp: 'Open in the app', viewOnMap: 'View on the map', propertiesIn: (c) => `Properties in ${c}`, browse: (c) => `Browse real estate listed in ${c} and pay with Pi.`, noListings: 'No listings here yet.' },
  ar: { bed: 'غرف', bath: 'حمامات', sold: 'اتباع', openApp: 'افتح في التطبيق', viewOnMap: 'شوف على الخريطة', propertiesIn: (c) => `عقارات في ${c}`, browse: (c) => `اتصفح العقارات المعروضة في ${c} وادفع بـ Pi.`, noListings: 'مفيش عقارات معروضة هنا دلوقتي.' },
  fr: { bed: 'ch.', bath: 'sdb', sold: 'Vendu', openApp: "Ouvrir dans l'application", viewOnMap: 'Voir sur la carte', propertiesIn: (c) => `Biens immobiliers : ${c}`, browse: (c) => `Parcourez les biens proposés : ${c}. Payez avec Pi.`, noListings: "Aucune annonce pour l'instant." },
  es: { bed: 'hab.', bath: 'baños', sold: 'Vendido', openApp: 'Abrir en la app', viewOnMap: 'Ver en el mapa', propertiesIn: (c) => `Propiedades en ${c}`, browse: (c) => `Explora inmuebles en ${c} y paga con Pi.`, noListings: 'Aún no hay anuncios.' },
  pt: { bed: 'quartos', bath: 'banheiros', sold: 'Vendido', openApp: 'Abrir no app', viewOnMap: 'Ver no mapa', propertiesIn: (c) => `Imóveis em ${c}`, browse: (c) => `Veja imóveis anunciados em ${c} e pague com Pi.`, noListings: 'Ainda não há anúncios.' },
  ur: { bed: 'کمرے', bath: 'باتھ روم', sold: 'فروخت ہو گیا', openApp: 'ایپ میں کھولیں', viewOnMap: 'نقشے پر دیکھیں', propertiesIn: (c) => `${c} میں جائیدادیں`, browse: (c) => `${c} میں دستیاب جائیدادیں دیکھیں اور Pi سے ادائیگی کریں۔`, noListings: 'ابھی کوئی اشتہار نہیں۔' },
  zh: { bed: '卧室', bath: '浴室', sold: '已售', openApp: '在应用中打开', viewOnMap: '在地图上查看', propertiesIn: (c) => `${c}的房产`, browse: (c) => `浏览${c}的房源，并使用 Pi 支付。`, noListings: '暂无房源。' },
};

/** Country name in the page language. Falls back to English when the runtime has no names for it. */
export function countryName(code: string, lang: SeoLang, fallbackEn: string): string {
  if (lang === 'en') return fallbackEn;
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code) || fallbackEn;
  } catch {
    return fallbackEn;
  }
}

/** hreflang map for a public path: every language, plus x-default. */
export function seoAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of SEO_LANGS) out[l] = l === 'en' ? path : `${path}?lang=${l}`;
  out['x-default'] = path;
  return out;
}
