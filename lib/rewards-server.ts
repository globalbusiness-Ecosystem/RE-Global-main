import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { referralStats } from '@/lib/referrals-server';
import { personAccounts } from '@/lib/person-store';
import { badgeLevelFor } from '@/lib/badge-level';
import { getBadgeThresholds } from '@/lib/badge-server';
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
// visible reviews and invited friends who completed a stay or purchase. Nothing the user can write from the browser is counted.
export async function myRewards(uid: string, username: string, nowMs = Date.now()) {
  const today = new Date(nowMs).toISOString().slice(0, 10);
  const by = async (col: string, field: string, value: string) => {
    const s = await adminDb.collection(col).where(field, '==', value).limit(LIMIT).get();
    return s.docs.map((d: { data(): unknown }) => d.data() as Record<string, unknown>);
  };
  // Accounts linked to one person count together: the points, the level and the invited friends are the person's.
  const accounts = await personAccounts(uid, username);
  const [rules, ...parts] = await Promise.all([
    getRewardRules(),
    ...accounts.map(async (a) => {
      const [bookings, contracts, reviews, ref] = await Promise.all([
        by('bookings', 'uid', a.uid), by('contracts', 'buyerUsername', a.username), by('stay_reviews', 'uid', a.uid), referralStats(a.username, nowMs),
      ]);
      return { bookings, contracts, reviews, ref };
    }),
  ]);
  const referral = {
    invited: parts.reduce((n, p) => n + p.ref.invited, 0),
    qualified: parts.reduce((n, p) => n + p.ref.qualified, 0),
    referredBy: parts.some((p) => p.ref.referredBy),
  };
  const counts: Counts = {
    stays: parts.reduce((n, p) => n + countStays(p.bookings, today), 0),
    purchases: parts.reduce((n, p) => n + countPurchases(p.contracts), 0),
    reviews: parts.reduce((n, p) => n + p.reviews.filter((r) => r.hidden !== true).length, 0),
    referrals: referral.qualified,
  };
  const points = pointsFor(counts, rules);
  const badgeThresholds = await getBadgeThresholds();
  return { points, counts, rules, referral, badgeLevel: badgeLevelFor(points, badgeThresholds), badgeThresholds, ...progress(points, rules) };
}
