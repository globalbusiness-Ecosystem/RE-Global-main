import { describe, it, expect } from 'vitest';
import { unseenCount, loadSeen, markSeen } from '@/lib/alert-badge';
import type { StorageLike } from '@/lib/offline-bookings';

const mem = (): StorageLike & { data: Record<string, string> } => {
  const data: Record<string, string> = {};
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: (k) => { delete data[k]; } };
};

describe('alert badge', () => {
  it('counts only alerts that have not been seen', () => {
    expect(unseenCount(['a', 'b', 'c'], new Set(['b']))).toBe(2);
    expect(unseenCount([], new Set(['b']))).toBe(0);
    expect(unseenCount(['a', 'a'], new Set())).toBe(1);
  });
  it('opening the tab clears the dot, a new alert brings it back', () => {
    const s = mem();
    expect(unseenCount(['a', 'b'], loadSeen(s, 'u1'))).toBe(2);
    markSeen(s, 'u1', ['a', 'b']);
    expect(unseenCount(['a', 'b'], loadSeen(s, 'u1'))).toBe(0);
    expect(unseenCount(['a', 'b', 'c'], loadSeen(s, 'u1'))).toBe(1);
  });
  it('is per user', () => {
    const s = mem();
    markSeen(s, 'u1', ['a']);
    expect(unseenCount(['a'], loadSeen(s, 'u2'))).toBe(1);
    expect(unseenCount(['a'], loadSeen(s, ''))).toBe(1);
  });
  it('alerts that are gone drop out of the saved list', () => {
    const s = mem();
    markSeen(s, 'u1', ['a', 'b']);
    markSeen(s, 'u1', ['b']);
    expect([...loadSeen(s, 'u1')]).toEqual(['b']);
    markSeen(s, 'u1', []);
    expect(Object.keys(s.data)).toHaveLength(0);
  });
  it('survives blocked storage and corrupt data', () => {
    const bad: StorageLike = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => { throw new Error('x'); } };
    expect(() => markSeen(bad, 'u1', ['a'])).not.toThrow();
    expect(loadSeen(bad, 'u1').size).toBe(0);
    expect(loadSeen(null, 'u1').size).toBe(0);
    const s = mem();
    s.setItem('re_alerts_seen_v1:u1', '{oops');
    expect(loadSeen(s, 'u1').size).toBe(0);
    s.setItem('re_alerts_seen_v1:u1', JSON.stringify({ a: 1 }));
    expect(loadSeen(s, 'u1').size).toBe(0);
  });
});
