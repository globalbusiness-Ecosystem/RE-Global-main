import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { shareUrl, sharePath } from '@/lib/share';
import { SHARE_I18N } from '@/lib/share-i18n';
import { SEO_LANGS } from '@/lib/seo-i18n';

describe('shareUrl', () => {
  it('links to the public page in the visitor language', () => {
    expect(shareUrl('https://e.com', 'abc', 'en')).toBe('https://e.com/p/abc');
    expect(shareUrl('https://e.com', 'abc', 'fr')).toBe('https://e.com/p/abc?lang=fr');
    expect(shareUrl('https://e.com', 'abc', 'zh')).toBe('https://e.com/p/abc?lang=zh');
    expect(shareUrl('https://e.com/', 'abc')).toBe('https://e.com/p/abc');
  });
  it('ignores unknown languages and escapes the id', () => {
    expect(shareUrl('https://e.com', 'abc', 'xx')).toBe('https://e.com/p/abc');
    expect(shareUrl('https://e.com', 'a/b?c', 'en')).toBe('https://e.com/p/a%2Fb%3Fc');
  });
  it('gives a path for the in-app link', () => {
    expect(sharePath('abc', 'ar')).toBe('/p/abc?lang=ar');
    expect(sharePath('abc', 'en')).toBe('/p/abc');
  });
});

describe('share texts', () => {
  it('every language has every text', () => {
    for (const l of SEO_LANGS) for (const v of Object.values(SHARE_I18N[l])) expect(v.trim().length).toBeGreaterThan(1);
  });
});

describe('wiring', () => {
  it('the in-app property details can be shared and reported', () => {
    const b = readFileSync('components/pages/buy-page.tsx', 'utf8');
    expect(b).toContain('<ShareListing');
    expect(b).toContain('<ReportListing');
    expect(b).toContain('data-testid="share-link"');
  });
});
