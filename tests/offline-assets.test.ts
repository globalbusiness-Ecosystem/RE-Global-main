import { describe, it, expect } from 'vitest';
import { OFFLINE_COPY_I18N, loadOfflineAssets, pickHolding, pickPayout, saveOfflineAssets } from '@/lib/offline-assets';
import { OFFLINE_TTL_MS, type StorageLike } from '@/lib/offline-bookings';

const mem = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); }, removeItem: (k) => { data.delete(k); } };
};
const H = { id: 'h1', propertyTitle: 'Villa', shares: 5, totalShares: 100, amount: 50, status: 'confirmed', uid: 'secret', email: 'x@y.z' };
const P = { id: 'p1', kind: 'refund', amount: 7, status: 'pending', createdAt: 'x', uid: 'u' };

describe('offline assets', () => {
  it('keeps only the displayed fields', () => {
    expect(pickHolding(H)).toEqual({ id: 'h1', propertyTitle: 'Villa', shares: 5, totalShares: 100, amount: 50, status: 'confirmed' });
    expect(pickPayout(P)).toEqual({ id: 'p1', kind: 'refund', amount: 7, status: 'pending' });
    expect(pickHolding({ shares: 1 })).toBeNull();
    expect(pickPayout(null)).toBeNull();
  });
  it('saves and loads for the same user only', () => {
    const s = mem();
    saveOfflineAssets(s, 'u1', { holdings: [H], payouts: [P] }, 1000);
    expect(loadOfflineAssets(s, 'u1', 2000)?.holdings).toHaveLength(1);
    expect(loadOfflineAssets(s, 'u2', 2000)).toBeNull();
    expect(JSON.stringify([...s.data.values()])).not.toContain('secret');
  });
  it('expires after 30 days and ignores future dates', () => {
    const s = mem();
    saveOfflineAssets(s, 'u1', { holdings: [H], payouts: [] }, 1000);
    expect(loadOfflineAssets(s, 'u1', 1000 + OFFLINE_TTL_MS + 1)).toBeNull();
    expect(s.data.size).toBe(0);
    saveOfflineAssets(s, 'u1', { holdings: [H], payouts: [] }, 10_000_000);
    expect(loadOfflineAssets(s, 'u1', 1000)).toBeNull();
  });
  it('removes the copy when there is nothing left, survives bad data and a blocked store', () => {
    const s = mem();
    saveOfflineAssets(s, 'u1', { holdings: [H], payouts: [] }, 1);
    saveOfflineAssets(s, 'u1', { holdings: [], payouts: [] }, 2);
    expect(s.data.size).toBe(0);
    s.setItem('re_offline_assets_v1:u1', '{not json');
    expect(loadOfflineAssets(s, 'u1', 3)).toBeNull();
    const broken: StorageLike = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => { throw new Error('x'); } };
    expect(() => saveOfflineAssets(broken, 'u1', { holdings: [H], payouts: [] }, 1)).not.toThrow();
    expect(loadOfflineAssets(broken, 'u1', 1)).toBeNull();
    const before = s.data.size;
    saveOfflineAssets(s, '', { holdings: [H], payouts: [] }, 1);
    expect(s.data.size).toBe(before);
  });
  it('has the date placeholder in all 7 languages', () => {
    expect(Object.keys(OFFLINE_COPY_I18N)).toHaveLength(7);
    for (const t of Object.values(OFFLINE_COPY_I18N)) expect(t).toContain('{date}');
  });
});
