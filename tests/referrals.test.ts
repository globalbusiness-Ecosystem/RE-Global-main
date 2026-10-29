import { describe, it, expect, vi, beforeEach } from 'vitest';

type Doc = Record<string, unknown>;
const store: Record<string, Record<string, Doc>> = {};
const ref = (col: string, id: string) => ({ __col: col, __id: id, get: async () => ({ exists: !!store[col]?.[id], id, data: () => store[col]?.[id] }) });
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ref(name, id),
      where: (field: string, _op: string, value: unknown) => ({
        limit: (n: number) => ({
          get: async () => ({
            docs: Object.entries(store[name] ?? {}).filter(([, d]) => d[field] === value).slice(0, n).map(([id, d]) => ({ id, data: () => d })),
          }),
        }),
      }),
    }),
    runTransaction: async (fn: (tx: unknown) => Promise<void>) =>
      fn({
        get: (r: { get: () => Promise<unknown> }) => r.get(),
        set: (r: { __col: string; __id: string }, data: Doc, opts?: { merge?: boolean }) => {
          store[r.__col] ??= {};
          store[r.__col][r.__id] = opts?.merge ? { ...(store[r.__col][r.__id] ?? {}), ...data } : data;
        },
      }),
  },
}));
vi.mock('firebase-admin/firestore', () => ({ Timestamp: { now: () => ({ fake: true }) } }));

import { normalizeReferralCode } from '@/lib/rewards';
import { redeemReferral, referralStats } from '@/lib/referrals-server';
import { myRewards } from '@/lib/rewards-server';

beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });
const now = Date.parse('2026-10-23T10:00:00Z');

describe('normalizeReferralCode', () => {
  it('accepts letters and digits, in any case', () => {
    expect(normalizeReferralCode(' x15ds4 ')).toBe('X15DS4');
    expect(normalizeReferralCode('ABCD')).toBe('ABCD');
  });
  it('rejects everything else', () => {
    for (const v of ['', 'abc', 'A'.repeat(13), 'AB CD', 'AB-CD', 12345, null, undefined, {}]) expect(normalizeReferralCode(v)).toBeNull();
  });
});

describe('redeemReferral', () => {
  const seed = () => { store.referrals = { amr: { username: 'amr', code: 'AMR123' } }; };
  it('links a new customer to the friend who owns the code', async () => {
    seed();
    expect(await redeemReferral('u-sam', 'sam', 'amr123')).toEqual({ ok: true });
    expect(store.referrals.sam).toMatchObject({ username: 'sam', uid: 'u-sam', referredBy: 'amr' });
  });
  it('refuses a missing code and a malformed one', async () => {
    seed();
    expect(await redeemReferral('u-sam', 'sam', 'NOPE99')).toMatchObject({ ok: false, status: 404, error: 'notFound' });
    expect(await redeemReferral('u-sam', 'sam', '!')).toMatchObject({ ok: false, status: 400, error: 'invalid' });
  });
  it('refuses your own code', async () => {
    seed();
    expect(await redeemReferral('u-amr', 'amr', 'AMR123')).toMatchObject({ ok: false, error: 'own' });
  });
  it('refuses a second code', async () => {
    seed();
    store.referrals.sam = { username: 'sam', referredBy: 'someone' };
    expect(await redeemReferral('u-sam', 'sam', 'AMR123')).toMatchObject({ ok: false, status: 409, error: 'already' });
    expect(store.referrals.sam.referredBy).toBe('someone');
  });
  it('refuses two friends crediting each other', async () => {
    store.referrals = { amr: { username: 'amr', code: 'AMR123', referredBy: 'sam' } };
    expect(await redeemReferral('u-sam', 'sam', 'AMR123')).toMatchObject({ ok: false, error: 'mutual' });
  });
  it('refuses someone who already booked or bought', async () => {
    seed();
    store.bookings = { b1: { uid: 'u-sam', status: 'confirmed', end: '2026-12-01' } };
    expect(await redeemReferral('u-sam', 'sam', 'AMR123')).toMatchObject({ ok: false, status: 409, error: 'notNew' });
    expect(store.referrals.sam).toBeUndefined();
  });
  it('lets someone with only a cancelled booking use a code', async () => {
    seed();
    store.bookings = { b1: { uid: 'u-sam', status: 'cancelled', end: '2026-12-01' } };
    expect(await redeemReferral('u-sam', 'sam', 'AMR123')).toEqual({ ok: true });
  });
});

describe('referralStats and points', () => {
  it('counts invited friends and only those who completed a stay or purchase', async () => {
    store.referrals = {
      amr: { username: 'amr', code: 'AMR123' },
      f1: { username: 'f1', uid: 'u-f1', referredBy: 'amr' },
      f2: { username: 'f2', uid: 'u-f2', referredBy: 'amr' },
      f3: { username: 'f3', uid: 'u-f3', referredBy: 'amr' },
      other: { username: 'other', uid: 'u-o', referredBy: 'zed' },
    };
    store.bookings = {
      b1: { uid: 'u-f1', status: 'confirmed', end: '2026-10-01' },
      b2: { uid: 'u-f2', status: 'confirmed', end: '2026-12-01' },
    };
    store.contracts = { c1: { buyerUsername: 'f3', status: 'completed', type: 'buy' } };
    expect(await referralStats('amr', now)).toEqual({ invited: 3, qualified: 2, referredBy: false });
  });
  it('reports whether this member already used a code', async () => {
    store.referrals = { sam: { username: 'sam', referredBy: 'amr' } };
    expect((await referralStats('sam', now)).referredBy).toBe(true);
  });
  it('adds referral points to the member total', async () => {
    store.referrals = {
      amr: { username: 'amr', code: 'AMR123' },
      f1: { username: 'f1', uid: 'u-f1', referredBy: 'amr' },
    };
    store.contracts = { c1: { buyerUsername: 'f1', status: 'completed', type: 'tokenized' } };
    const r = await myRewards('u-amr', 'amr', now);
    expect(r.counts.referrals).toBe(1);
    expect(r.points).toBe(50);
    expect(r.referral).toEqual({ invited: 1, qualified: 1, referredBy: false });
  });
  it('does not count self-referral records', async () => {
    store.referrals = { amr: { username: 'amr', uid: 'u-amr', referredBy: 'amr' } };
    store.contracts = { c1: { buyerUsername: 'amr', status: 'completed', type: 'buy' } };
    expect((await referralStats('amr', now)).qualified).toBe(0);
  });
});
