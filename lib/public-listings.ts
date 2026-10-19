// Public (search-engine facing) view of a listing: pure helpers, no Firebase here.
import { COUNTRIES, isCountry } from '@/lib/legal-profiles';
import { formatPropertyPrice } from '@/lib/price-format';
import { hasValidCoords } from '@/lib/map-focus';
import { SEO_LANGS, SEO_I18N, countryName, isRtl, seoLang, type SeoLang } from '@/lib/seo-i18n';

export { seoLang, type SeoLang };

export type PublicListing = {
  id: string;
  title: string;
  titleAr: string;
  location: string;
  locationAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  type: string;
  country: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  lat?: number;
  lng?: number;
  translations: Partial<Record<SeoLang, { title: string; location: string; description: string }>>;
  sold: boolean;
};

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (v !== undefined && v !== null && Number.isFinite(Number(v)) ? Number(v) : undefined);
const EXCLUSIVE = ['buy', 'offplan', 'abroad'];

// Only the three text fields of the supported languages, as plain strings.
function readTranslations(raw: unknown): PublicListing['translations'] {
  const out: PublicListing['translations'] = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const l of SEO_LANGS) {
    const t = (raw as Record<string, unknown>)[l];
    if (!t || typeof t !== 'object') continue;
    const o = t as Record<string, unknown>;
    const v = { title: str(o.title), location: str(o.location), description: str(o.description) };
    if (v.title || v.location || v.description) out[l] = v;
  }
  return out;
}

// Returns null for hidden or unusable documents so they never reach a search engine.
export function toPublicListing(id: string, raw: Record<string, unknown> | undefined): PublicListing | null {
  if (!raw || raw.hidden === true) return null;
  const title = str(raw.title) || str(raw.titleAr);
  if (!title) return null;
  const type = str(raw.type);
  const images = Array.isArray(raw.images) ? raw.images.filter((x): x is string => typeof x === 'string') : [];
  return {
    id,
    title,
    titleAr: str(raw.titleAr) || title,
    location: str(raw.location) || str(raw.locationAr),
    locationAr: str(raw.locationAr) || str(raw.location),
    description: str(raw.description) || str(raw.descriptionAr),
    descriptionAr: str(raw.descriptionAr) || str(raw.description),
    price: Number(raw.price) || 0,
    currency: str(raw.currency) || 'PI',
    type,
    country: isCountry(raw.country) ? (raw.country as string) : '',
    image: str(raw.image) || images[0] || '',
    bedrooms: num(raw.bedrooms),
    bathrooms: num(raw.bathrooms),
    area: num(raw.area),
    ...(hasValidCoords(raw.lat, raw.lng) ? { lat: Number(raw.lat), lng: Number(raw.lng) } : {}),
    translations: readTranslations(raw.translations),
    sold: EXCLUSIVE.includes(type) && raw.status === 'sold',
  };
}

export function listingTexts(l: PublicListing, lang: SeoLang) {
  const S = SEO_I18N[lang];
  const tr = l.translations[lang];
  const country = l.country ? countryName(l.country, lang, COUNTRIES[l.country]?.en ?? '') : '';
  const title = lang === 'ar' ? l.titleAr : lang === 'en' ? l.title : tr?.title || l.title;
  const loc = lang === 'ar' ? l.locationAr : lang === 'en' ? l.location : tr?.location || l.location;
  const raw = lang === 'ar' ? l.descriptionAr : lang === 'en' ? l.description : tr?.description || l.description;
  const place = [loc, country].filter(Boolean).join(isRtl(lang) ? '، ' : ', ');
  const facts = [
    l.bedrooms ? `${l.bedrooms} ${S.bed}` : '',
    l.bathrooms ? `${l.bathrooms} ${S.bath}` : '',
    l.area ? `${l.area} m²` : '',
  ].filter(Boolean).join(' · ');
  const price = formatPropertyPrice(l, lang);
  const body = raw.replace(/\s+/g, ' ').trim();
  const description = [price, place, facts, body].filter(Boolean).join(' — ').slice(0, 300);
  return { title, place, facts, price, body, description };
}

// schema.org structured data so search engines can show the listing as a rich result.
export function listingJsonLd(l: PublicListing, base: string, lang: SeoLang) {
  const t = listingTexts(l, lang);
  const url = `${base}/p/${l.id}`;
  const countryEn = l.country ? COUNTRIES[l.country]?.en : undefined;
  const hasGeo = l.lat !== undefined && l.lng !== undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: t.title,
    url,
    inLanguage: lang,
    description: t.description,
    ...(l.image ? { image: l.image } : {}),
    ...(hasGeo
      ? {
          contentLocation: {
            '@type': 'Place',
            name: t.place || t.title,
            geo: { '@type': 'GeoCoordinates', latitude: l.lat, longitude: l.lng },
            ...(l.country ? { address: { '@type': 'PostalAddress', addressCountry: l.country } } : {}),
          },
        }
      : l.country
        ? { contentLocation: { '@type': 'Country', name: countryEn } }
        : {}),
    offers: {
      '@type': 'Offer',
      price: l.price,
      priceCurrency: l.currency.toUpperCase() === 'PI' ? 'XPI' : l.currency.toUpperCase(),
      availability: l.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url,
    },
  };
}

export const countrySlug = (code: string) => code.toLowerCase();
export const countryFromSlug = (slug: string): string | null => {
  const c = slug.toUpperCase();
  return isCountry(c) ? c : null;
}
