import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseHomeFeatures, MAX_FEATURE_CARDS, MAX_CARD_TITLE, MAX_CARD_TEXT, DEFAULT_HOME_FEATURES } from '@/lib/home-features';

const src = (p: string) => readFileSync(p, 'utf8');

describe('home picture cards parsing', () => {
  it('no cards by default and for junk', () => {
    expect(DEFAULT_HOME_FEATURES.cards).toBeNull();
    for (const bad of [null, {}, { cards: 'x' }, { cards: [] }, { cards: [{}] }]) expect(parseHomeFeatures(bad).cards).toBeNull();
  });
  it('keeps a card with an https picture and a title; the line is optional', () => {
    const r = parseHomeFeatures({ cards: [
      { img: 'https://x.test/a.webp', t: { en: ' Luxury ', ar: 'فخامة' }, d: { en: 'Top towers' } },
      { img: 'https://x.test/b.webp', t: { ar: 'بدون سطر' } },
    ] });
    expect(r.cards).toEqual([
      { img: 'https://x.test/a.webp', t: { en: 'Luxury', ar: 'فخامة' }, d: { en: 'Top towers' } },
      { img: 'https://x.test/b.webp', t: { ar: 'بدون سطر' }, d: null },
    ]);
  });
  it('drops cards without a safe picture or without a title', () => {
    const r = parseHomeFeatures({ cards: [
      { img: 'http://x.test/a.webp', t: { en: 'plain http' } },
      { img: 'javascript:alert(1)', t: { en: 'script' } },
      { img: 'data:image/png;base64,AAAA', t: { en: 'data' } },
      { img: 'https://x.test/ok.webp', t: {} },
      { img: 'https://x.test/ok.webp', t: { en: 'fine' } },
    ] });
    expect(r.cards).toEqual([{ img: 'https://x.test/ok.webp', t: { en: 'fine' }, d: null }]);
  });
  it('limits the number of cards and the length of the title and the line', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ img: `https://x.test/${i}.webp`, t: { en: 'c' + i } }));
    expect(parseHomeFeatures({ cards: many }).cards).toHaveLength(MAX_FEATURE_CARDS);
    expect(parseHomeFeatures({ cards: [{ img: 'https://x.test/a.webp', t: { en: 'a'.repeat(MAX_CARD_TITLE + 1) } }] }).cards).toBeNull();
    const longLine = parseHomeFeatures({ cards: [{ img: 'https://x.test/a.webp', t: { en: 'ok' }, d: { en: 'b'.repeat(MAX_CARD_TEXT + 1) } }] });
    expect(longLine.cards?.[0].d).toBeNull();
  });
  it('the old strip settings are untouched', () => {
    const r = parseHomeFeatures({ enabled: false, title: { en: 'Why us' }, items: [{ icon: 'gem', t: { en: 'Luxury' } }] });
    expect(r.enabled).toBe(false);
    expect(r.items).toEqual([{ icon: 'gem', t: { en: 'Luxury' } }]);
    expect(r.cards).toBeNull();
  });
});

describe('wiring', () => {
  it('the admin route rejects broken cards and keeps its guards', () => {
    const r = src('app/api/admin/home-features/route.ts');
    expect(r).toMatch(/Each picture card needs/);
    expect(r.match(/isAdminRequest/g)!.length).toBeGreaterThanOrEqual(3);
  });
  it('the admin editor uploads pictures and writes the text on them', () => {
    const c = src('components/admin/home-features-settings.tsx');
    expect(c).toMatch(/shrinkImage/);
    expect(c).toMatch(/\/api\/admin\/upload-image/);
    expect(c).toMatch(/cards:/);
  });
  it('the home page shows the cards with the title and line over the picture', () => {
    const h = src('components/pages/home-page.tsx');
    expect(h).toMatch(/homeFeatures\.cards/);
    expect(h).toMatch(/<figcaption/);
    expect(h).toMatch(/pickText\(c\.t, language\)/);
  });
});
