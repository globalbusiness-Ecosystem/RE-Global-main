import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { HOME_CATEGORIES } from '@/lib/home-i18n';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('shares market card on the home page', () => {
  it('has a title in all 7 languages', () => {
    const row = HOME_CATEGORIES['share-market'];
    expect(row).toBeDefined();
    for (const l of LANGS) expect(row[l].trim().length).toBeGreaterThan(0);
    for (const l of ['ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const) expect(row[l]).not.toBe(row.en);
  });
  it('is in the category grid and opens the market page', () => {
    const src = readFileSync('components/pages/home-page.tsx', 'utf8');
    expect(src).toContain("id: 'share-market'");
    expect(src).toContain("cat.id === 'share-market'");
    expect(src).toContain("router.push('/market')");
  });
  it('every card in the grid has a translated title', () => {
    const src = readFileSync('components/pages/home-page.tsx', 'utf8');
    const ids = [...src.matchAll(/\{ id: '([\w-]+)', titleEn:/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(10);
    for (const id of ids) expect(HOME_CATEGORIES[id], id).toBeDefined();
  });
  it('the market page itself still requires sign-in for trading and is reachable at /market', () => {
    const page = readFileSync('app/market/page.tsx', 'utf8');
    expect(page).toContain("mk('signIn', language)");
  });
});
