import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PROFILE_LABELS, pl, type ProfileLabelKey } from '@/lib/profile-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

describe('profile labels', () => {
  it('has every label in all 7 languages, none empty', () => {
    for (const [key, row] of Object.entries(PROFILE_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(0);
    }
  });
  it('falls back to English for an unknown language', () => {
    expect(pl('verify', 'xx')).toBe('Verify');
    expect(pl('verify', 'es')).toBe('Verificar');
  });
  it('the profile page uses the labels for the email-code flow', () => {
    const src = readFileSync('components/pages/profile-page.tsx', 'utf8');
    expect(src).not.toMatch(/language === 'ar' \?/);
    const used = [...src.matchAll(/pl\('([A-Za-z]+)'/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThanOrEqual(12);
    for (const k of used) expect(Object.keys(PROFILE_LABELS), k).toContain(k as ProfileLabelKey);
  });
});
