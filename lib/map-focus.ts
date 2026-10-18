// "Show me this property on the map": the listing card saves where it is, the map page reads it and flies there.
export const FOCUS_KEY = 'focusProperty';
export type MapFocus = { id: string; lat: number; lng: number; title?: string };

export function hasValidCoords(lat: unknown, lng: unknown): boolean {
  if (lat === null || lat === undefined || lat === '' || lng === null || lng === undefined || lng === '') return false;
  const a = Number(lat), b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180 && !(a === 0 && b === 0);
}

export function focusFromProperty(p: { id: string; lat?: unknown; lng?: unknown; title?: string }): MapFocus | null {
  if (!hasValidCoords(p.lat, p.lng)) return null;
  return { id: String(p.id), lat: Number(p.lat), lng: Number(p.lng), ...(p.title ? { title: String(p.title).slice(0, 120) } : {}) };
}

/** Reads what a card saved. Null for anything that is not a real place (the old cards saved 0,0). */
export function parseFocus(raw: string | null): MapFocus | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? focusFromProperty({ id: String(o.id ?? ''), lat: o.lat, lng: o.lng, title: typeof o.title === 'string' ? o.title : undefined }) : null;
  } catch {
    return null;
  }
}
