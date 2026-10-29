import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_RULES, countPurchases, countStays, pointsFor, progress, readRules, type Counts, type Rules } from '@/lib/rewards';

const LIMIT = 1000;

export async function getRewardRules(): Promise<Rules> {
  try {
    const snap = await adminDb.collection('settings').doc('rewards').get();
    return snap.exists ? readRules(snap.data()) : DEFAULT_RULES;
  } catch {
    return DEFAULT_RULES;
  }
}

// Points come only from records the server already trusts: confirmed past stays, completed purchase contracts
// and visible reviews. Nothing the user can write from the browser is counted.
export async function myRewards(uid: string, username: string, nowMs = Date.now()) {
  const today = new Date(nowMs).toISOString().slice(0, 10);
  const by = async (col: string, field: string, value: string) => {
    const s = await adminDb.collection(col).where(field, '==', value).limit(LIMIT).get();
    return s.docs.map((d: { data(): unknown }) => d.data() as Record<string, unknown>);
  };
  const [rules, bookings, contracts, reviews] = await Promise.all([
    getRewardRules(), by('bookings', 'uid', uid), by('contracts', 'buyerUsername', username), by('stay_reviews', 'uid', uid),
  ]);
  const counts: Counts = {
    stays: countStays(bookings, today),
    purchases: countPurchases(contracts),
    reviews: reviews.filter((r) => r.hidden !== true).length,
  };
  const points = pointsFor(counts, rules);
  return { points, counts, rules, ...progress(points, rules) };
}
