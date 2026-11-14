import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { listPublicListings } from '@/lib/public-listings-server';
import { computeMarketStats, type MarketStats, type StatContract } from '@/lib/market-stats';

const withTimeout = <T,>(p: Promise<T>, ms = 5000) => Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

// Public numbers for the Market Analytics page. Only aggregates leave the server: no names, no contract text.
export async function getMarketStats(): Promise<MarketStats> {
  const [listings, contracts] = await Promise.all([
    listPublicListings(1000),
    withTimeout(adminDb.collection('contracts').select('type', 'amount', 'currency', 'status', 'createdAt').limit(5000).get())
      .then((s): StatContract[] => s.docs.map((d: any) => {
        const c = d.data();
        const at = c.createdAt?.toMillis ? c.createdAt.toMillis() : 0;
        return { type: String(c.type ?? ''), amount: Number(c.amount) || 0, currency: String(c.currency ?? ''), status: String(c.status ?? ''), createdAtMs: at };
      }))
      .catch(() => [] as StatContract[]),
  ]);
  return computeMarketStats(listings.map((l) => ({ type: l.type, country: l.country, price: l.price, currency: l.currency, sold: l.sold })), contracts);
}
