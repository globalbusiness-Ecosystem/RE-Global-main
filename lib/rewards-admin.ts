import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { getRewardRules } from '@/lib/rewards-server';
import { buildOverview } from '@/lib/rewards-overview';

const LIMIT = 2000;
const all = async (col: string) => {
  const s = await adminDb.collection(col).limit(LIMIT).get();
  return s.docs.map((d: { data(): unknown }) => d.data() as Record<string, unknown>);
};

export async function adminRewardsOverview(nowMs = Date.now()) {
  const [rules, bookings, contracts, reviews, referrals] = await Promise.all([
    getRewardRules(), all('bookings'), all('contracts'), all('stay_reviews'), all('referrals'),
  ]);
  const today = new Date(nowMs).toISOString().slice(0, 10);
  return { ...buildOverview({ bookings, contracts, reviews, referrals }, rules, today), truncated: [bookings, contracts, reviews, referrals].some((r) => r.length >= LIMIT) };
}
