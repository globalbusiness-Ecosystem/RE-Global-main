import { hasValidCoords } from './map-focus';

// What is missing from a listing, so the admin sees at a glance what visitors will not get.
export type Gap = 'image' | 'price' | 'coords' | 'country' | 'description' | 'translations';

/** Gaps that break something for the visitor (no photo, no price to pay, 📍 button disabled). */
export const CRITICAL_GAPS: readonly Gap[] = ['image', 'price', 'coords'];

export const GAP_LABELS: Record<Gap, string> = {
  image: 'بدون صورة',
  price: 'بدون سعر',
  coords: 'بدون موقع خريطة',
  country: 'بدون دولة (نص العقد)',
  description: 'بدون وصف',
  translations: 'مش مترجم',
};

const TRANSLATION_LANGS = ['ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const filled = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

export function listingGaps(p: Record<string, unknown> | null | undefined): Gap[] {
  if (!p || typeof p !== 'object') return [];
  const out: Gap[] = [];
  const images = Array.isArray(p.images) ? p.images.filter(filled) : [];
  if (!filled(p.image) && images.length === 0) out.push('image');
  if (!(Number(p.price) > 0)) out.push('price');
  if (!hasValidCoords(p.lat, p.lng)) out.push('coords');
  if (!filled(p.country)) out.push('country');
  if (!filled(p.description)) out.push('description');
  const tr = p.translations && typeof p.translations === 'object' ? (p.translations as Record<string, unknown>) : {};
  const translated = TRANSLATION_LANGS.filter((l) => {
    const t = tr[l];
    return t && typeof t === 'object' && filled((t as Record<string, unknown>).title);
  }).length;
  if (translated < TRANSLATION_LANGS.length) out.push('translations');
  return out;
}

export const hasCriticalGap = (gaps: readonly Gap[]) => gaps.some((g) => CRITICAL_GAPS.includes(g));

/** How many visible listings have a critical gap (hidden ones are not shown to visitors, so they do not count). */
export function countIncomplete(items: ReadonlyArray<Record<string, unknown>>): number {
  return items.filter((p) => p.hidden !== true && hasCriticalGap(listingGaps(p))).length;
}
