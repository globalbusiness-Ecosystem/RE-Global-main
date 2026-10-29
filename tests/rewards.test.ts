import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';

type Doc = Record<string, unknown>;
const store: Record<string, Record<string, Doc>> = {};
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ({ get: async () => ({ exists: !!store[name]?.[id], data: () => store[name]?.[id] }) }),
      where: (field: string, _op: string, value: unknown) => ({
        limit: () => ({
          get: async () => ({ docs: Object.values(store[name] ?? {}).filter((d) => d[field] === value).map((d) => ({ data: () => d })) }),
        }),
      }),
    }),
  },
}));

import {
  DEFAULT_RULES, REWARD_I18N, TIER_IDS, countPurchases, countStays, parseRules, pointsFor, progress, readRules, tierFor, tierName,
} from '@/lib/rewards';
import { myRewards } from '@/lib/rewards-server';

const valid = { points: { stay: 100, purchase: 500, review: 20 }, tiers: { silver: 300, gold: 1000, platinum: 3000 }, benefits: { gold: '  Late checkout  ' } };

describe('parseRules', () => {
  it('accepts the defaults and trims benefits', () => {
    const r = parseRules(valid);
    expect(r?.tiers).toEqual({ bronze: 0, silver: 300, gold: 1000, platinum: 3000 });
    expect(r?.benefits.gold).toBe('Late checkout');
    expect(r?.benefits.bronze).toBe('');
    expect(parseRules({ ...valid, points: { stay: '50', purchase: '0', review: '5' } })?.points).toEqual({ stay: 50, purchase: 0, review: 5 });
  });
  it('rejects bad points and unordered levels', () => {
    expect(parseRules(null)).toBeNull();
    expect(parseRules({ ...valid, points: { stay: -1, purchase: 1, review: 1 } })).toBeNull();
    expect(parseRules({ ...valid, points: { stay: 1.5, purchase: 1, review: 1 } })).toBeNull();
    expect(parseRules({ ...valid, points: { stay: 10001, purchase: 1, review: 1 } })).toBeNull();
    expect(parseRules({ ...valid, tiers: { silver: 300, gold: 300, platinum: 3000 } })).toBeNull();
    expect(parseRules({ ...valid, tiers: { silver: 0, gold: 10, platinum: 20 } })).toBeNull();
    expect(parseRules({ ...valid, tiers: { silver: 5, gold: 10 } })).toBeNull();
  });
  it('cuts long benefit text and strips control characters', () => {
    const r = parseRules({ ...valid, benefits: { gold: 'a\u0000b' + 'x'.repeat(500) } });
    expect(r?.benefits.gold.length).toBe(200);
    expect(r?.benefits.gold.startsWith('a b')).toBe(true);
  });
  it('readRules falls back to the defaults', () => {
    expect(readRules({ junk: true })).toEqual(DEFAULT_RULES);
    expect(readRules(undefined)).toEqual(DEFAULT_RULES);
  });
});

describe('points and levels', () => {
  const rules = DEFAULT_RULES;
  it('adds points per action', () => expect(pointsFor({ stays: 2, purchases: 1, reviews: 3 }, rules)).toBe(200 + 500 + 60));
  it('finds the level, including the exact threshold', () => {
    expect(tierFor(0, rules)).toBe('bronze');
    expect(tierFor(299, rules)).toBe('bronze');
    expect(tierFor(300, rules)).toBe('silver');
    expect(tierFor(1000, rules)).toBe('gold');
    expect(tierFor(99999, rules)).toBe('platinum');
  });
  it('reports progress to the next level', () => {
    expect(progress(150, rules)).toEqual({ tier: 'bronze', next: 'silver', remaining: 150, pct: 50 });
    expect(progress(300, rules)).toMatchObject({ tier: 'silver', next: 'gold', remaining: 700, pct: 0 });
    expect(progress(5000, rules)).toEqual({ tier: 'platinum', next: null, remaining: 0, pct: 100 });
  });
});

describe('counting verified activity', () => {
  it('counts only confirmed stays that are over', () => {
    const rows = [
      { status: 'confirmed', end: '2026-10-01' }, { status: 'confirmed', end: '2026-10-23' }, { status: 'confirmed', end: '2026-10-24' },
      { status: 'cancelled', end: '2026-09-01' }, { status: 'review', end: '2026-09-01' },
    ];
    expect(countStays(rows, '2026-10-23')).toBe(2);
  });
  it('counts only completed purchase contracts, not stays or resale', () => {
    const rows = [
      { status: 'completed', type: 'buy' }, { status: 'completed', type: 'tokenized' }, { status: 'completed', type: 'hotel' },
      { status: 'completed', type: 'rent' }, { status: 'completed', type: 'resale' }, { status: 'pending', type: 'buy' },
    ];
    expect(countPurchases(rows)).toBe(2);
  });
});

describe('myRewards', () => {
  beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });
  const now = Date.parse('2026-10-23T10:00:00Z');
  it('builds points from the user\'s own records only', async () => {
    store.bookings = {
      a: { uid: 'u1', status: 'confirmed', end: '2026-10-10' },
      b: { uid: 'u1', status: 'confirmed', end: '2026-12-01' },
      c: { uid: 'u2', status: 'confirmed', end: '2026-10-10' },
    };
    store.contracts = { x: { buyerUsername: 'sam', status: 'completed', type: 'buy' }, y: { buyerUsername: 'other', status: 'completed', type: 'buy' } };
    store.stay_reviews = { a: { uid: 'u1', hidden: false }, z: { uid: 'u1', hidden: true } };
    const r = await myRewards('u1', 'sam', now);
    expect(r.counts).toEqual({ stays: 1, purchases: 1, reviews: 1 });
    expect(r.points).toBe(100 + 500 + 20);
    expect(r.tier).toBe('silver');
  });
  it('uses the admin rules when saved', async () => {
    store.settings = { rewards: { points: { stay: 10, purchase: 20, review: 5 }, tiers: { silver: 20, gold: 40, platinum: 80 }, benefits: { silver: 'Free breakfast' } } };
    store.bookings = { a: { uid: 'u1', status: 'confirmed', end: '2026-10-10' }, b: { uid: 'u1', status: 'confirmed', end: '2026-10-11' } };
    const r = await myRewards('u1', 'sam', now);
    expect(r.points).toBe(20);
    expect(r.tier).toBe('silver');
    expect(r.rules.benefits.silver).toBe('Free breakfast');
  });
  it('gives a new user 0 points on the default rules', async () => {
    const r = await myRewards('new', 'nobody', now);
    expect(r).toMatchObject({ points: 0, tier: 'bronze', next: 'silver', remaining: 300 });
  });
});

describe('texts', () => {
  it('every language has every text', () => {
    for (const [lang, t] of Object.entries(REWARD_I18N)) {
      for (const [k, v] of Object.entries(t)) expect(v.trim().length, `${lang}.${k}`).toBeGreaterThan(0);
      expect(t.nextLevel).toContain('{n}');
      expect(t.nextLevel).toContain('{tier}');
      expect(t.perEach).toContain('{n}');
      expect(t.from).toContain('{n}');
    }
    for (const id of TIER_IDS) expect(tierName('xx', id).length).toBeGreaterThan(0);
  });
});

describe('settings page wiring', () => {
  const s = readFileSync('components/pages/settings-page.tsx', 'utf8');
  it('has the rewards tab and uses the shared icon pieces', () => {
    expect(s).toContain("'profile', 'rewards', 'security', 'notifications'");
    expect(s).toContain('<RewardsPanel');
    expect(s).toContain('<RowChevron');
  });
  it('has no bare chevrons or left-only padding left', () => {
    expect(s).not.toContain('<ChevronRight');
    expect(s).not.toContain('pl-11');
    expect(s).toContain('rtl:rotate-180');
  });
  it('mounts the admin rewards settings', () => {
    expect(readFileSync('components/admin/content-tab.tsx', 'utf8')).toContain('<RewardsSettings');
  });
});
