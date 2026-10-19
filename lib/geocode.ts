import { hasValidCoords } from './map-focus';

export type GeoHit = { lat: number; lng: number; label: string };

/** What we ask the map service: the address the admin typed, plus the country name when one is chosen. */
export function geocodeQuery(location: unknown, countryName?: unknown): string {
  const loc = typeof location === 'string' ? location.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) : '';
  if (!loc) return '';
  const c = typeof countryName === 'string' ? countryName.trim().slice(0, 80) : '';
  return c && !loc.toLowerCase().includes(c.toLowerCase()) ? `${loc}, ${c}` : loc;
}

/** Reads a Nominatim answer. Null unless the first result is a real place. */
export function parseGeocode(data: unknown): GeoHit | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const r = data[0] as Record<string, unknown> | null;
  if (!r || typeof r !== 'object') return null;
  if (!hasValidCoords(r.lat, r.lon)) return null;
  const label = typeof r.display_name === 'string' ? r.display_name.slice(0, 200) : '';
  return { lat: Number(Number(r.lat).toFixed(6)), lng: Number(Number(r.lon).toFixed(6)), label };
}

/** A link the admin can open to check the spot on a real map. */
export function osmLink(lat: unknown, lng: unknown): string | null {
  if (!hasValidCoords(lat, lng)) return null;
  const a = Number(lat), b = Number(lng);
  return `https://www.openstreetmap.org/?mlat=${a}&mlon=${b}#map=17/${a}/${b}`;
}
