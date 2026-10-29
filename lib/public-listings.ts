// Public (search-engine facing) view of a listing: pure helpers, no Firebase here.
import { COUNTRIES, isCountry } from '@/lib/legal-profiles';
import { formatPropertyPrice } from '@/lib/price-format';
import { hasValidCoords } from '@/lib/map-focus';
import { SEO_LANGS, SEO_I18N, countryName, isRtl, seoLang, type SeoLang } from '@/lib/seo-i18n';
import { MAX_GUESTS_LIMIT, NIGHTS_LIMIT, TIME_RE, stayFacts } from '@/lib/stay-info';
import { bookingStrings } from '@/lib/booking-i18n';

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
  /** Hotel / rental facts set by the admin (HH:MM times, guest limit). */
  checkInTime?: string;
  checkOutTime?: string;
  maxGuests?: number;
  minNights?: number;
  maxNights?: number;
  lat?: number;
  lng?: number;
  /** Average of the visible guest reviews (1-5) and how many there are. Hotels and rentals only. */
  ratingValue?: number;
  ratingCount?: number;
  /** ISO time of the last edit, when the document has one. */
  updatedAt?: string;
  translations: Partial<Record<SeoLang, { title: string; location: string; description: string }>>;
  sold: boolean;
};

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (v !== undefined && v !== null && Number.isFinite(Number(v)) ? Number(v) : undefined);
const EXCLUSIVE = ['buy', 'offplan', 'abroad'];
const isStay = (t: string) => t === 'hotel' || t === 'rent';

// Adds the review average to a hotel / rental listing. Nothing is added when there are no reviews.
export function withRating(l: PublicListing, s: { count: number; avg: number } | null | undefined): PublicListing {
  if (!s || !isStay(l.type) || !(s.count >= 1) || !(s.avg >= 1 && s.avg <= 5)) return l;
  return { ...l, ratingValue: s.avg, ratingCount: s.count };
}

// Firestore Timestamp, Date, number or ISO string -> ISO string (or undefined for anything else).
function isoTime(v: unknown): string | undefined {
  try {
    const d = v && typeof (v as { toDate?: unknown }).toDate === 'function' ? (v as { toDate: () => Date }).toDate()
      : typeof v === 'string' || typeof v === 'number' ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined;
  } catch {
    return undefined;
  }
}

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
    ...(typeof raw.checkInTime === 'string' && TIME_RE.test(raw.checkInTime) ? { checkInTime: raw.checkInTime } : {}),
    ...(typeof raw.checkOutTime === 'string' && TIME_RE.test(raw.checkOutTime) ? { checkOutTime: raw.checkOutTime } : {}),
    ...(Number.isInteger(Number(raw.maxGuests)) && Number(raw.maxGuests) >= 1 && Number(raw.maxGuests) <= MAX_GUESTS_LIMIT ? { maxGuests: Number(raw.maxGuests) } : {}),
    ...(type === 'hotel' && Number.isInteger(Number(raw.minNights)) && Number(raw.minNights) >= 1 && Number(raw.minNights) <= NIGHTS_LIMIT ? { minNights: Number(raw.minNights) } : {}),
    ...(type === 'hotel' && Number.isInteger(Number(raw.maxNights)) && Number(raw.maxNights) >= 1 && Number(raw.maxNights) <= NIGHTS_LIMIT ? { maxNights: Number(raw.maxNights) } : {}),
    ...(hasValidCoords(raw.lat, raw.lng) ? { lat: Number(raw.lat), lng: Number(raw.lng) } : {}),
    ...(isoTime(raw.updatedAt) ? { updatedAt: isoTime(raw.updatedAt) } : {}),
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
    ...(isStay(l.type) ? stayFacts(l, lang).map((f) => f.text) : []),
  ].filter(Boolean).join(' · ');
  const unit = l.type === 'hotel' ? bookingStrings(lang).perNight : l.type === 'rent' ? bookingStrings(lang).perMonth : '';
  const price = formatPropertyPrice(l, lang) + (unit ? ` / ${unit}` : '');
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
  const hotel = l.type === 'hotel';
  const currency = l.currency.toUpperCase() === 'PI' ? 'XPI' : l.currency.toUpperCase();
  return {
    '@context': 'https://schema.org',
    '@type': hotel ? 'Hotel' : 'RealEstateListing',
    name: t.title,
    url,
    inLanguage: lang,
    description: t.description,
    ...(l.image ? { image: l.image } : {}),
    ...(hotel ? {
      ...(l.checkInTime ? { checkinTime: l.checkInTime } : {}),
      ...(l.checkOutTime ? { checkoutTime: l.checkOutTime } : {}),
      ...(l.maxGuests ? { occupancy: { '@type': 'QuantitativeValue', maxValue: l.maxGuests } } : {}),
      ...(hasGeo ? { geo: { '@type': 'GeoCoordinates', latitude: l.lat, longitude: l.lng } } : {}),
      address: { '@type': 'PostalAddress', ...(t.place ? { streetAddress: t.place } : {}), ...(l.country ? { addressCountry: l.country } : {}) },
      ...(l.ratingValue && l.ratingCount ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: l.ratingValue, reviewCount: l.ratingCount, bestRating: 5, worstRating: 1 } } : {}),
    } : {}),
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
      priceCurrency: currency,
      ...(isStay(l.type) ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: l.price, priceCurrency: currency, unitCode: hotel ? 'DAY' : 'MON' } } : {}),
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
