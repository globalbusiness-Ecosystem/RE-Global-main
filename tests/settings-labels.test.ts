import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SETTINGS_LABELS, sl, type SettingsLabelKey } from '@/lib/settings-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('settings labels', () => {
  it('has every label in all 7 languages, none empty', () => {
    for (const [key, row] of Object.entries(SETTINGS_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(0);
    }
  });
  it('translations really differ from English outside English', () => {
    const same = Object.entries(SETTINGS_LABELS).filter(([, row]) => (row as Record<string, string>).ar === (row as Record<string, string>).en);
    expect(same).toEqual([]);
  });
  it('fills in the number and falls back to English for an unknown language', () => {
    expect(sl('referralCount', 'fr', 3)).toBe('Personnes ayant utilisé votre code : 3');
    expect(sl('referralCount', 'zh', 0)).toContain('0');
    expect(sl('copy', 'xx' as never)).toBe('Copy');
  });
  it('keeps the {n} placeholder in the count label for every language', () => {
    for (const l of LANGS) expect((SETTINGS_LABELS.referralCount as Record<string, string>)[l]).toContain('{n}');
  });
  it('the Settings page uses these labels instead of Arabic/English-only text', () => {
    const src = readFileSync('components/pages/settings-page.tsx', 'utf8');
    expect(src).toContain("sl('copy'");
    for (const old of ["'Referral Code'", "'Price alerts'", "'Account Status'", "'Community'"]) expect(src).not.toContain(old);
  });
  it('every key used by the page exists', () => {
    const src = readFileSync('components/pages/settings-page.tsx', 'utf8');
    const used = [...src.matchAll(/sl\('([A-Za-z]+)'/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThan(20);
    for (const k of used) expect(Object.keys(SETTINGS_LABELS), k).toContain(k as SettingsLabelKey);
  });
});
