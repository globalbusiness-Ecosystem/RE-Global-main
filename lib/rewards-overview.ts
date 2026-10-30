import { PURCHASE_TYPES, REFERRAL_CAP, TIER_IDS, pointsFor, tierFor, type Counts, type Rules, type TierId } from './rewards';

// Admin view of the rewards program: who earned what. Pure, so it can be tested without a database.
export type OverviewInput = {
  bookings: { uid?: unknown; username?: unknown; status?: unknown; end?: unknown }[];
  contracts: { buyerUsername?: unknown; status?: unknown; type?: unknown }[];
  reviews: { uid?: unknown; hidden?: unknown }[];
  referrals: { username?: unknown; referredBy?: unknown }[];
};

export type Member = { username: string; points: number; tier: TierId } & Counts;
export type Overview = {
  totals: { members: number; points: number; redeemed: number; qualifiedReferrals: number; byTier: Record<TierId, number> };
  top: Member[];
};

const str = (v: unknown) => (typeof v === 'string' && v ? v : '');

export function buildOverview(input: OverviewInput, rules: Rules, today: string, topN = 50): Overview {
  const counts = new Map<string, Counts>();
  const get = (u: string) => {
    let c = counts.get(u);
    if (!c) counts.set(u, (c = { stays: 0, purchases: 0, reviews: 0, referrals: 0 }));
    return c;
  };
  const uidToName = new Map<string, string>();
  for (const b of input.bookings) {
    const u = str(b.username), id = str(b.uid);
    if (!u) continue;
    if (id) uidToName.set(id, u);
    if (b.status === 'confirmed' && typeof b.end === 'string' && b.end <= today) get(u).stays++;
  }
  for (const c of input.contracts) {
    const u = str(c.buyerUsername);
    if (u && c.status === 'completed' && typeof c.type === 'string' && PURCHASE_TYPES.includes(c.type)) get(u).purchases++;
  }
  for (const r of input.reviews) {
    const u = uidToName.get(str(r.uid));
    if (u && r.hidden !== true) get(u).reviews++;
  }
  // A friend counts for the member who invited them once the friend has a finished stay or purchase.
  const seen = new Map<string, number>();
  let redeemed = 0;
  let qualifiedReferrals = 0;
  for (const r of input.referrals) {
    const friend = str(r.username), owner = str(r.referredBy);
    if (!owner) continue;
    redeemed++;
    if (!friend || friend === owner) continue;
    const fc = counts.get(friend);
    if (!fc || fc.stays + fc.purchases === 0) continue;
    const n = seen.get(owner) ?? 0;
    if (n >= REFERRAL_CAP) continue;
    seen.set(owner, n + 1);
    get(owner).referrals++;
    qualifiedReferrals++;
  }
  const members: Member[] = [];
  const byTier = Object.fromEntries(TIER_IDS.map((t) => [t, 0])) as Record<TierId, number>;
  let total = 0;
  for (const [username, c] of counts) {
    const points = pointsFor(c, rules);
    if (points <= 0) continue;
    const tier = tierFor(points, rules);
    byTier[tier]++;
    total += points;
    members.push({ username, points, tier, ...c });
  }
  members.sort((a, b) => b.points - a.points || a.username.localeCompare(b.username));
  return { totals: { members: members.length, points: total, redeemed, qualifiedReferrals, byTier }, top: members.slice(0, topN) };
}
