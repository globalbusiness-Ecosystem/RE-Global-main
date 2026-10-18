import 'server-only';
import { parseRates, type FxRates } from '@/lib/fx';

// Daily exchange rates from a free public source (no key). Cached for 6 hours (and the last good answer is kept
// if the source is down), so the site makes a handful of requests a day, not one per visitor.
const URL_RATES = 'https://open.er-api.com/v6/latest/USD';
const TTL_MS = 6 * 60 * 60 * 1000;
let cache: { rates: FxRates; at: number } | null = null;

export async function getFxRates(): Promise<{ rates: FxRates; updatedAt: string } | null> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return { rates: cache.rates, updatedAt: new Date(cache.at).toISOString() };
  try {
    const res = await fetch(URL_RATES, { signal: AbortSignal.timeout(5000), next: { revalidate: 21600 } });
    if (res.ok) {
      const rates = parseRates(await res.json());
      if (rates) {
        cache = { rates, at: now };
        return { rates, updatedAt: new Date(now).toISOString() };
      }
    }
  } catch {
    // fall through to the last good answer
  }
  return cache ? { rates: cache.rates, updatedAt: new Date(cache.at).toISOString() } : null;
}

export function _resetFxCache(): void { cache = null; }
