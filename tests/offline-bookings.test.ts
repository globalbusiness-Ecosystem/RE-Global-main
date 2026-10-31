import { describe, it, expect } from 'vitest';
import { saveOfflineBookings, loadOfflineBookings, browserStore, pickBooking, OFFLINE_TTL_MS, type StorageLike } from '@/lib/offline-bookings';

const mem = (): StorageLike & { data: Record<string, string> } => {
  const data: Record<string, string> = {};
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: (k) => { delete data[k]; } };
};
const b = (over: Record<string, unknown> = {}) => ({ id: 'b1', propertyTitle: 'Nile Suite', propertyType: 'hotel', start: '2026-11-02', end: '2026-11-04', nights: 2, amount: 20, status: 'confirmed', ...over });
const NOW = 1_800_000_000_000;

describe('offline bookings', () => {
  it('saves and loads a user\'s own bookings', () => {
    const s = mem();
    saveOfflineBookings(s, 'u1', [b(), b({ id: 'b2' })], NOW);
    const r = loadOfflineBookings(s, 'u1', NOW + 1000);
    expect(r?.bookings.map((x) => x.id)).toEqual(['b1', 'b2']);
    expect(r?.at).toBe(NOW);
  });
  it('never shows one user\'s copy to another, or to nobody', () => {
    const s = mem();
    saveOfflineBookings(s, 'u1', [b()], NOW);
    expect(loadOfflineBookings(s, 'u2', NOW)).toBeNull();
    expect(loadOfflineBookings(s, '', NOW)).toBeNull();
  });
  it('keeps only the known fields', () => {
    const s = mem();
    saveOfflineBookings(s, 'u1', [b({ doorCode: '9999', uid: 'secret', hostReply: 'Welcome' })], NOW);
    const stored = Object.values(s.data).join('');
    expect(stored).not.toContain('9999');
    expect(stored).not.toContain('secret');
    expect(loadOfflineBookings(s, 'u1', NOW)?.bookings[0].hostReply).toBe('Welcome');
  });
  it('expires after 30 days and deletes the stale copy', () => {
    const s = mem();
    saveOfflineBookings(s, 'u1', [b()], NOW);
    expect(loadOfflineBookings(s, 'u1', NOW + OFFLINE_TTL_MS - 1)).not.toBeNull();
    expect(loadOfflineBookings(s, 'u1', NOW + OFFLINE_TTL_MS + 1)).toBeNull();
    expect(Object.keys(s.data)).toHaveLength(0);
  });
  it('an empty list clears the saved copy (cancelled/removed bookings do not linger)', () => {
    const s = mem();
    saveOfflineBookings(s, 'u1', [b()], NOW);
    saveOfflineBookings(s, 'u1', [], NOW + 5);
    expect(loadOfflineBookings(s, 'u1', NOW + 10)).toBeNull();
  });
  it('survives broken storage and corrupt data', () => {
    const bad: StorageLike = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); }, removeItem: () => { throw new Error('x'); } };
    expect(() => saveOfflineBookings(bad, 'u1', [b()], NOW)).not.toThrow();
    expect(loadOfflineBookings(bad, 'u1', NOW)).toBeNull();
    const s = mem();
    s.setItem('re_offline_bookings_v1:u1', '{not json');
    expect(loadOfflineBookings(s, 'u1', NOW)).toBeNull();
    s.setItem('re_offline_bookings_v1:u1', JSON.stringify({ at: NOW, bookings: 'x' }));
    expect(loadOfflineBookings(s, 'u1', NOW)).toBeNull();
  });
  it('browserStore is null where there is no window (and never throws)', () => {
    expect(browserStore()).toBeNull();
  });
  it('rejects bookings without an id', () => {
    expect(pickBooking({ propertyTitle: 'x' })).toBeNull();
    expect(pickBooking(null)).toBeNull();
  });
});
