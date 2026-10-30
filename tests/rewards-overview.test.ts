import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildOverview, type OverviewInput } from '@/lib/rewards-overview';
import { DEFAULT_RULES, REFERRAL_CAP } from '@/lib/rewards';

const today = '2026-10-23';
const empty: OverviewInput = { bookings: [], contracts: [], reviews: [], referrals: [] };

describe('buildOverview', () => {
  it('is empty when nobody earned anything', () => {
    const o = buildOverview(empty, DEFAULT_RULES, today);
    expect(o.top).toEqual([]);
    expect(o.totals).toMatchObject({ members: 0, points: 0, redeemed: 0, qualifiedReferrals: 0 });
  });

  it('adds stays, purchases and visible reviews per member and ranks them', () => {
    const o = buildOverview({
      bookings: [
        { uid: 'u1', username: 'sam', status: 'confirmed', end: '2026-10-01' },
        { uid: 'u1', username: 'sam', status: 'confirmed', end: '2026-10-05' },
        { uid: 'u1', username: 'sam', status: 'confirmed', end: '2026-12-05' },
        { uid: 'u2', username: 'amr', status: 'cancelled', end: '2026-10-01' },
        { uid: 'u3', username: 'lee', status: 'confirmed', end: '2026-10-02' },
      ],
      contracts: [{ buyerUsername: 'lee', status: 'completed', type: 'buy' }, { buyerUsername: 'lee', status: 'completed', type: 'hotel' }],
      reviews: [{ uid: 'u1', hidden: false }, { uid: 'u1', hidden: true }],
      referrals: [],
    }, DEFAULT_RULES, today);
    expect(o.top.map((m) => m.username)).toEqual(['lee', 'sam']);
    expect(o.top[0]).toMatchObject({ points: 600, stays: 1, purchases: 1, tier: 'silver' });
    expect(o.top[1]).toMatchObject({ points: 220, stays: 2, reviews: 1, tier: 'bronze' });
    expect(o.totals).toMatchObject({ members: 2, points: 820 });
    expect(o.totals.byTier).toEqual({ bronze: 1, silver: 1, gold: 0, platinum: 0 });
  });

  it('rewards the inviter only after the friend finished a stay or purchase', () => {
    const o = buildOverview({
      bookings: [
        { uid: 'f1', username: 'f1', status: 'confirmed', end: '2026-10-01' },
        { uid: 'f2', username: 'f2', status: 'confirmed', end: '2026-12-31' },
      ],
      contracts: [{ buyerUsername: 'f3', status: 'completed', type: 'tokenized' }],
      reviews: [],
      referrals: [
        { username: 'f1', referredBy: 'amr' }, { username: 'f2', referredBy: 'amr' }, { username: 'f3', referredBy: 'amr' },
        { username: 'f4', referredBy: 'amr' }, { username: 'amr', referredBy: 'amr' }, { username: 'amr' },
      ],
    }, DEFAULT_RULES, today);
    const amr = o.top.find((m) => m.username === 'amr');
    expect(amr?.referrals).toBe(2);
    expect(amr?.points).toBe(2 * DEFAULT_RULES.points.referral);
    expect(o.totals.redeemed).toBe(5);
    expect(o.totals.qualifiedReferrals).toBe(2);
  });

  it('caps the friends rewarded per member', () => {
    const referrals = Array.from({ length: REFERRAL_CAP + 10 }, (_, i) => ({ username: `f${i}`, referredBy: 'amr' }));
    const contracts = referrals.map((r) => ({ buyerUsername: r.username, status: 'completed', type: 'buy' }));
    const o = buildOverview({ ...empty, referrals, contracts }, DEFAULT_RULES, today);
    expect(o.top.find((m) => m.username === 'amr')?.referrals).toBe(REFERRAL_CAP);
  });

  it('uses the admin rules and limits the list', () => {
    const rules = { ...DEFAULT_RULES, points: { ...DEFAULT_RULES.points, stay: 400 } };
    const bookings = Array.from({ length: 5 }, (_, i) => ({ uid: `u${i}`, username: `m${i}`, status: 'confirmed', end: '2026-01-01' }));
    const o = buildOverview({ ...empty, bookings }, rules, today, 3);
    expect(o.top).toHaveLength(3);
    expect(o.totals.members).toBe(5);
    expect(o.top[0].tier).toBe('silver');
  });

  it('ignores rows with no username', () => {
    const o = buildOverview({ ...empty, bookings: [{ uid: 'u1', status: 'confirmed', end: '2026-01-01' }] }, DEFAULT_RULES, today);
    expect(o.top).toEqual([]);
  });
});

describe('admin wiring', () => {
  it('shows the leaderboard under the rewards settings', () => {
    const s = readFileSync('components/admin/content-tab.tsx', 'utf8');
    expect(s).toContain('<RewardsLeaderboard');
    expect(s).toContain('<RewardsSettings');
  });
});
