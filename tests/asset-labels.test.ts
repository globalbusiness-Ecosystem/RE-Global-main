import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ASSET_LABELS, al, type AssetLabelKey } from '@/lib/asset-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

describe('asset labels', () => {
  it('has every label in all 7 languages, none empty', () => {
    for (const [key, row] of Object.entries(ASSET_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(0);
    }
  });
  it('falls back to English for an unknown language', () => {
    expect(al('paid', 'xx')).toBe('Paid');
    expect(al('paid', 'fr')).toBe('Payé');
  });
  it('the section uses the labels and no longer decides by ar only', () => {
    const src = readFileSync('components/my-properties.tsx', 'utf8');
    expect(src).not.toMatch(/\bar \?/);
    const used = [...src.matchAll(/al\('([A-Za-z]+)'/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThan(10);
    for (const k of used) expect(Object.keys(ASSET_LABELS), k).toContain(k as AssetLabelKey);
  });
});
