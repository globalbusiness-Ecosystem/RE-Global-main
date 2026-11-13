import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseHomeFeatures, pickText, DEFAULT_HOME_FEATURES, MAX_FEATURE_ITEMS } from '@/lib/home-features';

const src = (p: string) => readFileSync(p, 'utf8');

describe('home features parsing', () => {
  it('falls back to the built-in strip for junk', () => {
    for (const bad of [null, undefined, 5, 'x', [], { items: 'no' }, { items: [{ icon: 'x' }] }]) {
      const r = parseHomeFeatures(bad);
      expect(r.items).toBeNull();
      expect(r.enabled).toBe(true);
    }
    expect(DEFAULT_HOME_FEATURES.enabled).toBe(true);
  });
  it('keeps a hidden flag, a title and valid items; unknown icons become a star', () => {
    const r = parseHomeFeatures({ enabled: false, title: { en: ' Why us ', ar: 'ليه احنا' }, items: [{ icon: 'gem', t: { en: 'Luxury' } }, { icon: 'evil', t: { ar: 'عقود' } }, { icon: 'zap', t: {} }] });
    expect(r.enabled).toBe(false);
    expect(r.title).toEqual({ en: 'Why us', ar: 'ليه احنا' });
    expect(r.items).toEqual([{ icon: 'gem', t: { en: 'Luxury' } }, { icon: 'star', t: { ar: 'عقود' } }]);
  });
  it('limits the number and the length of the lines', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ icon: 'star', t: { en: 'x' + i } }));
    expect(parseHomeFeatures({ items: many }).items).toHaveLength(MAX_FEATURE_ITEMS);
    expect(parseHomeFeatures({ items: [{ icon: 'star', t: { en: 'a'.repeat(81) } }] }).items).toBeNull();
  });
  it('shows the language asked for, then English, then Arabic', () => {
    expect(pickText({ en: 'A', fr: 'B' }, 'fr')).toBe('B');
    expect(pickText({ en: 'A' }, 'zh')).toBe('A');
    expect(pickText({ ar: 'ع' }, 'zh')).toBe('ع');
  });
});

describe('wiring', () => {
  it('the admin route is guarded and audited, and has its own sub-tab', () => {
    const r = src('app/api/admin/home-features/route.ts');
    expect(r.match(/isAdminRequest/g)!.length).toBeGreaterThanOrEqual(3);
    expect(r).toContain("logAdmin('homeFeatures.update'");
    expect(src('components/admin/properties-tab.tsx')).toContain('HomeFeaturesSettings');
  });
  it('the home page has no Pay with Pi block and the strip follows the saved settings and the theme colours', () => {
    const h = src('components/pages/home-page.tsx');
    expect(h).not.toContain('UnifiedPaymentButton');
    expect(h).not.toContain('payWithPi');
    expect(h).toContain('useHomeFeatures');
    expect(h).toContain('homeFeatures.enabled');
    expect(h).not.toContain('#D4AF37');
    expect(h).not.toContain('rgba(212,175,55');
  });
});
