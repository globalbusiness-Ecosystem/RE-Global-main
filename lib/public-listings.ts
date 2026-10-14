// Public (search-engine facing) view of a listing: pure helpers, no Firebase here.
import { COUNTRIES, isCountry } from '@/lib/legal-profiles';
import { formatPropertyPrice } from '@/lib/price-format';

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
  sold: boolean;
};

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (v !== undefined && v !== null && Number.isFinite(Number(v)) ? Number(v) : undefined);
const EXCLUSIVE = ['buy', 'offplan', 'abroad'];

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
    sold: EXCLUSIVE.includes(type) && raw.status === 'sold',
  };
}

export type SeoLang = 'en' | 'ar';
export const seoLang = (v: unknown): SeoLang => (v === 'ar' ? 'ar' : 'en');

export function listingTexts(l: PublicListing, lang: SeoLang) {
  const ar = lang === 'ar';
  const country = l.country ? COUNTRIES[l.country]?.[lang] ?? '' : '';
  const title = ar ? l.titleAr : l.title;
  const place = [ar ? l.locationAr : l.location, country].filter(Boolean).join('، ');
  const facts = [
    l.bedrooms ? `${l.bedrooms} ${ar ? 'غرف' : 'bed'}` : '',
    l.bathrooms ? `${l.bathrooms} ${ar ? 'حمامات' : 'bath'}` : '',
    l.area ? `${l.area} m²` : '',
  ].filter(Boolean).join(' · ');
  const price = formatPropertyPrice(l);
  const body = (ar ? l.descriptionAr : l.description).replace(/\s+/g, ' ').trim();
  const description = [price, place, facts, body].filter(Boolean).join(' — ').slice(0, 300);
  return { title, place, facts, price, body, description };
}

// schema.org structured data so search engines can show the listing as a rich result.
export function listingJsonLd(l: PublicListing, base: string, lang: SeoLang) {
  const t = listingTexts(l, lang);
  const url = `${base}/p/${l.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: t.title,
    url,
    description: t.description,
    ...(l.image ? { image: l.image } : {}),
    ...(l.country ? { contentLocation: { '@type': 'Country', name: COUNTRIES[l.country]?.en } } : {}),
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
