export const TYPES = ['buy', 'rent', 'hotel', 'tokenized', 'abroad', 'offplan', 'invest'];
export const PROPERTY_TYPES = ['apartment', 'villa', 'penthouse', 'commercial'];
export const STATUSES = ['available', 'sold', 'under_construction'];
import { isCountry } from '@/lib/legal-profiles';
import { parseStayInfo } from '@/lib/stay-info';
const CURRENCIES = ['Pi', 'USD', 'EGP'];
const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

function str(v: unknown, max: number, multiline = false): string {
  if (typeof v !== 'string') return '';
  const cleaned = multiline
    ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    : v.replace(/[\u0000-\u001f\u007f]+/g, ' ');
  return cleaned.trim().slice(0, max);
}

// '' is allowed (field left empty); null means "present but not a safe URL".
function url(v: unknown): string | null {
  const s = str(v, 2000);
  if (!s) return '';
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? s : null;
  } catch {
    return null;
  }
}

function num(v: unknown, min: number, max: number): number | null {
  if (v === '' || v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}


export type ParsedProperty = { ok: true; doc: Record<string, unknown> } | { ok: false; error: string };

const fail = (error: string): ParsedProperty => ({ ok: false, error });

/** Validates and normalises admin input for a property. Does not set createdAt/updatedAt. */
export function parsePropertyInput(b: any): ParsedProperty {
  if (!b || typeof b !== 'object') return fail('Invalid request');
  const title = str(b.title, 200);
  if (!title) return fail('Title is required');
  const price = num(b.price, 0, 1e12);
  const bedrooms = num(b.bedrooms, 0, 1000);
  const bathrooms = num(b.bathrooms, 0, 1000);
  const area = num(b.area, 0, 1e7);
  if (price === null || bedrooms === null || bathrooms === null || area === null) return fail('Invalid number');
  if (!CURRENCIES.includes(b.currency)) return fail('Invalid currency');
  if (!TYPES.includes(b.type)) return fail('Invalid listing type');
  if (!PROPERTY_TYPES.includes(b.propertyType)) return fail('Invalid property type');
  if (!STATUSES.includes(b.status)) return fail('Invalid status');

  const image = url(b.image);
  const vrUrl = url(b.vrUrl);
  const contractUrl = url(b.contractUrl);
  if (image === null || vrUrl === null || contractUrl === null) return fail('Invalid URL');
  const imagesIn: unknown[] = Array.isArray(b.images) ? b.images : [];
  if (imagesIn.length > 30) return fail('Too many images');
  const images: string[] = [];
  for (const raw of imagesIn) {
    const u = url(raw);
    if (u === null) return fail('Invalid image URL');
    if (u) images.push(u);
  }

  const amenitiesIn = b.amenities && typeof b.amenities === 'object' ? b.amenities : {};
  const amenities = {
    pool: amenitiesIn.pool === true,
    gym: amenitiesIn.gym === true,
    parking: amenitiesIn.parking === true,
    security: amenitiesIn.security === true,
  };

  const doc: Record<string, unknown> = {
    title,
    location: str(b.location, 200),
    price,
    currency: b.currency,
    type: b.type,
    propertyType: b.propertyType,
    status: b.status,
    bedrooms,
    bathrooms,
    area,
    description: str(b.description, 5000, true),
    image,
    images,
    vrUrl,
    contractUrl,
    tokenized: b.tokenized === true,
    amenities,
  };

  // Optional fields used by the app when present.
  for (const k of ['titleAr', 'locationAr'] as const) {
    const s = str(b[k], 200);
    if (s) doc[k] = s;
  }
  const descAr = str(b.descriptionAr, 5000, true);
  if (descAr) doc.descriptionAr = descAr;
  const pay = num(b.payAmountPi, 0, 1e9);
  if (pay === null) return fail('Invalid payment amount');
  if (pay > 0) doc.payAmountPi = pay;
  const shares = num(b.totalShares, 0, 1_000_000);
  if (shares === null || !Number.isInteger(shares)) return fail('Total shares must be a whole number');
  if (shares > 0) doc.totalShares = shares;
  const stay = parseStayInfo(b);
  if (!stay.ok) return fail(stay.error);
  Object.assign(doc, stay.info);
  if (doc.type !== 'hotel') { delete doc.minNights; delete doc.maxNights; }
  if (isCountry(b.country)) doc.country = b.country;
  doc.featured = b.featured === true;
  doc.hidden = b.hidden === true;
  const lat = num(b.lat, -90, 90);
  const lng = num(b.lng, -180, 180);
  if (lat === null || lng === null) return fail('Invalid coordinates');
  if (b.lat !== undefined && b.lat !== '' && b.lng !== undefined && b.lng !== '') {
    doc.lat = lat;
    doc.lng = lng;
  }
  if (b.translations && typeof b.translations === 'object') {
    const t: Record<string, Record<string, string>> = {};
    for (const lang of LANGS) {
      const src = b.translations[lang];
      if (!src || typeof src !== 'object') continue;
      const entry: Record<string, string> = {};
      const tt = str(src.title, 200);
      const tl = str(src.location, 200);
      const td = str(src.description, 5000, true);
      if (tt) entry.title = tt;
      if (tl) entry.location = tl;
      if (td) entry.description = td;
      if (Object.keys(entry).length) t[lang] = entry;
    }
    if (Object.keys(t).length) doc.translations = t;
  }

  return { ok: true, doc };
}
