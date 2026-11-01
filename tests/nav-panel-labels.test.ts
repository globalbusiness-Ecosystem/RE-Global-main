import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { NAV_PANEL_LABELS, SPEECH_LANG, np, routeTextLang, speechLang, type NavPanelKey } from '@/lib/nav-panel-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

describe('navigation panel labels', () => {
  it('has every label in all 7 languages, none empty', () => {
    for (const [key, row] of Object.entries(NAV_PANEL_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(0);
    }
  });
  it('falls back to English for an unknown language', () => {
    expect(np('next', 'xx')).toBe('Next');
    expect(np('next', 'fr')).toBe('Suivant');
  });
  it('picks a speech voice per language, English when unknown', () => {
    expect(Object.keys(SPEECH_LANG).sort()).toEqual([...LANGS].sort());
    expect(speechLang('fr')).toBe('fr-FR');
    expect(speechLang('ar')).toBe('ar-SA');
    expect(speechLang('xx')).toBe('en-US');
  });
  it('route text is Arabic for Arabic users and English for everyone else', () => {
    expect(routeTextLang('ar')).toBe('ar');
    for (const l of ['en', 'fr', 'es', 'pt', 'ur', 'zh', 'xx']) expect(routeTextLang(l)).toBe('en');
  });
  it('the panel uses the labels and no longer decides by isArabic', () => {
    const src = readFileSync('components/navigation-panel.tsx', 'utf8');
    expect(src).not.toContain('isArabic');
    const used = [...src.matchAll(/np\('([A-Za-z]+)'/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThanOrEqual(10);
    for (const k of used) expect(Object.keys(NAV_PANEL_LABELS), k).toContain(k as NavPanelKey);
    expect(src).toContain('routeTextLang(language)');
  });
});
