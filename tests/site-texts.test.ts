import { describe, it, expect } from 'vitest';
import { applyOverrides, flattenTexts, sanitizeOverrides } from '@/lib/site-texts';

const base = { a: 'A', list: ['x', 'y'], rows: [{ t: 'T0', n: 1 }], fn: (n: number) => `n${n}` };

describe('site texts', () => {
  it('flattens string leaves only', () => {
    expect(flattenTexts(base)).toEqual({ a: 'A', 'list.0': 'x', 'list.1': 'y', 'rows.0.t': 'T0' });
  });
  it('applies overrides by path and keeps functions', () => {
    const r = applyOverrides(base, { a: 'New', 'list.1': 'Z', 'rows.0.t': 'TT', 'rows.0.n': 'bad', nope: 'q' });
    expect(r.a).toBe('New'); expect(r.list).toEqual(['x', 'Z']); expect(r.rows[0]).toEqual({ t: 'TT', n: 1 });
    expect(r.fn(2)).toBe('n2');
    expect(base.a).toBe('A');
  });
  it('returns base untouched with no overrides', () => {
    expect(applyOverrides(base, null)).toBe(base);
  });
  it('sanitizes input', () => {
    expect(sanitizeOverrides({ a: ' hi ', b: '  ' })).toEqual({ ok: true, overrides: { a: 'hi' } });
    expect(sanitizeOverrides({ 'a b': 'x' }).ok).toBe(false);
    expect(sanitizeOverrides({ a: 5 }).ok).toBe(false);
    expect(sanitizeOverrides([]).ok).toBe(false);
  });
});
