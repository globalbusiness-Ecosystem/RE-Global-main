import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SHARE_PICKER_LABELS, sp, type SharePickerKey } from '@/lib/share-picker-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

describe('share picker labels', () => {
  it('has every label in all 7 languages, none empty', () => {
    for (const [key, row] of Object.entries(SHARE_PICKER_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(0);
    }
  });
  it('keeps the same placeholders in every language', () => {
    for (const [key, row] of Object.entries(SHARE_PICKER_LABELS)) {
      const want = (row as Record<string, string>).en.match(/\{\w+\}/g)?.sort() ?? [];
      for (const l of LANGS) expect((row as Record<string, string>)[l].match(/\{\w+\}/g)?.sort() ?? [], `${key}.${l}`).toEqual(want);
    }
  });
  it('fills in the numbers and falls back to English', () => {
    expect(sp('onlyLeft', 'en', { left: 3 })).toBe('Only 3 shares left');
    expect(sp('available', 'fr', { left: 4, total: 100 })).toBe('4 parts disponibles sur 100');
    expect(sp('available', 'ar', { left: 4, total: 100 })).toContain('100');
    expect(sp('soldOut', 'xx')).toBe('Fully subscribed');
    expect(sp('onlyLeft', 'en', { left: 7 })).not.toContain('{');
  });
  it('the picker uses the labels and no longer decides by ar only', () => {
    const src = readFileSync('components/share-picker.tsx', 'utf8');
    expect(src).not.toMatch(/\bar \?/);
    const used = [...src.matchAll(/sp\('([A-Za-z]+)'/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThanOrEqual(7);
    for (const k of used) expect(Object.keys(SHARE_PICKER_LABELS), k).toContain(k as SharePickerKey);
  });
});
