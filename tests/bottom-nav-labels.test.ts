import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BOTTOM_NAV_LABELS, bn } from '@/lib/bottom-nav-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const TABS = ['home', 'dashboard', 'alerts', 'map', 'profile', 'partners'] as const;

describe('bottom navigation labels', () => {
  it('has the six tabs and the error text in all 7 languages, none empty', () => {
    expect(Object.keys(BOTTOM_NAV_LABELS).sort()).toEqual([...TABS, 'error'].sort());
    for (const [key, row] of Object.entries(BOTTOM_NAV_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(1);
      for (const l of ['ar', 'ur', 'zh'] as const) expect((row as Record<string, string>)[l], `${key}.${l}`).not.toBe((row as Record<string, string>).en);
    }
  });
  it('tab names are short enough for a phone screen (max 16 characters)', () => {
    for (const t of TABS) for (const l of LANGS) expect((BOTTOM_NAV_LABELS[t] as Record<string, string>)[l].length, `${t}.${l}`).toBeLessThanOrEqual(16);
  });
  it('keeps the old English and Arabic names, falls back to English, ignores inherited names', () => {
    expect(bn('dashboard', 'ar')).toBe('لوحة التحكم');
    expect(bn('alerts', 'en')).toBe('Alerts');
    expect(bn('home', 'fr')).toBe('Accueil');
    expect(bn('home', 'xx')).toBe('Home');
    expect(bn('home', 'toString')).toBe('Home');
  });
  it('the bar uses the accessor for every tab and for its error message', () => {
    const src = readFileSync('components/bottom-nav.tsx', 'utf8');
    expect(src).not.toMatch(/labelEn|labelAr|language === 'ar'/);
    expect(src).toContain("bn('error', language)");
    for (const t of TABS) expect(src).toContain(`id: '${t}'`);
  });
});
