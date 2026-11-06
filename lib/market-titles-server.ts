import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { extractTitles, type MarketTitles } from '@/lib/market-titles';

const okId = (id: unknown): id is string => typeof id === 'string' && !!id && !id.includes('/') && id.length <= 128;

/** Titles (per language) of the given properties, one batched read. Never throws: on any problem the market just shows stored titles. */
export async function loadMarketTitles(propertyIds: unknown[]): Promise<MarketTitles> {
  try {
    const ids = [...new Set(propertyIds.filter(okId))].slice(0, 60);
    if (ids.length === 0) return {};
    const snaps = await adminDb.getAll(...ids.map((id) => adminDb.collection('properties').doc(id)));
    const out: MarketTitles = {};
    snaps.forEach((s, i) => {
      if (!s.exists) return;
      const t = extractTitles(s.data());
      if (Object.keys(t).length > 0) out[ids[i]] = t;
    });
    return out;
  } catch (err) {
    console.error('[market] titles error:', (err as Error)?.name);
    return {};
  }
}
