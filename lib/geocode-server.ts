import 'server-only';
import { parseGeocode, type GeoHit } from './geocode';

// OpenStreetMap Nominatim: free, asks for a real User-Agent and at most 1 request per second.
const UA = 'RE-Global/1.0 (+https://re-global-main.vercel.app)';
const cache = new Map<string, { at: number; hit: GeoHit | null }>();
const TTL = 24 * 60 * 60 * 1000;
let lastCall = 0;

export function _resetGeocodeCache() { cache.clear(); lastCall = 0; }

export async function geocode(query: string, countryCode?: string): Promise<GeoHit | null> {
  const key = `${query.toLowerCase()}|${(countryCode || '').toUpperCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.hit;

  const wait = lastCall + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, Math.min(wait, 1500)));
  lastCall = Date.now();

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  if (/^[A-Za-z]{2}$/.test(countryCode || '')) url.searchParams.set('countrycodes', (countryCode as string).toLowerCase());
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' }, signal: AbortSignal.timeout(6000), cache: 'no-store' });
    if (!res.ok) return null;
    const parsed = parseGeocode(await res.json());
    cache.set(key, { at: Date.now(), hit: parsed });
    return parsed;
  } catch {
    return null;
  }
}
