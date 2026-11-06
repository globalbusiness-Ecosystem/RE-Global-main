import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getMapPropertyTitle } from '@/lib/map-i18n';

const base = { title: 'Villa', titleAr: 'فيلا' };

describe('map titles use the admin translation of the listing', () => {
  const p = { ...base, translations: { fr: { title: 'Villa de luxe' }, zh: { title: '豪华别墅' }, es: { title: '  ' } } };
  it('uses the translation when there is one', () => {
    expect(getMapPropertyTitle(p, 'fr')).toBe('Villa de luxe');
    expect(getMapPropertyTitle(p, 'zh')).toBe('豪华别墅');
  });
  it('falls back to Arabic for ar and English for the rest', () => {
    expect(getMapPropertyTitle(p, 'ar')).toBe('فيلا');
    expect(getMapPropertyTitle(p, 'pt')).toBe('Villa');
    expect(getMapPropertyTitle(p, 'es')).toBe('Villa');
    expect(getMapPropertyTitle(base, 'fr')).toBe('Villa');
  });
  it('is safe against hostile language codes', () => {
    expect(getMapPropertyTitle(p, '__proto__' as never)).toBe('Villa');
    expect(getMapPropertyTitle(p, 'constructor' as never)).toBe('Villa');
  });
  it('the map page keeps the translations on admin listings', () => {
    const src = readFileSync('components/pages/map-page.tsx', 'utf8');
    expect(src).toContain('translations?: Record<string');
    expect(src).toContain('...firebaseProps.filter(p => p.lat && p.lng).map(p => ({...p,');
  });
});
