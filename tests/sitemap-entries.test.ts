import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { languageLinks, validDate, sitemapEntries } from '@/lib/sitemap-entries';
import { toPublicListing } from '@/lib/public-listings';
import { SEO_LANGS } from '@/lib/seo-i18n';

const mk = (id: string, extra: Record<string, unknown> = {}) => toPublicListing(id, { title: 'Villa', price: 1, country: 'AE', ...extra })!;

describe('languageLinks', () => {
  it('has every language plus x-default, as absolute links', () => {
    const l = languageLinks('https://e.com/p/1');
    expect(Object.keys(l).sort()).toEqual([...SEO_LANGS, 'x-default'].sort());
    expect(l.en).toBe('https://e.com/p/1');
    expect(l.ar).toBe('https://e.com/p/1?lang=ar');
    expect(l['x-default']).toBe('https://e.com/p/1');
  });
});

describe('validDate', () => {
  it('accepts real dates only', () => {
    expect(validDate('2026-10-01T10:00:00.000Z')?.toISOString()).toBe('2026-10-01T10:00:00.000Z');
    for (const bad of [undefined, '', 'nope']) expect(validDate(bad)).toBeUndefined();
  });
});

describe('public listing updatedAt', () => {
  it('reads Firestore timestamps, dates and ISO strings, and ignores junk', () => {
    const ts = { toDate: () => new Date('2026-10-01T10:00:00Z') };
    expect(mk('a', { updatedAt: ts }).updatedAt).toBe('2026-10-01T10:00:00.000Z');
    expect(mk('b', { updatedAt: '2026-09-01T00:00:00Z' }).updatedAt).toBe('2026-09-01T00:00:00.000Z');
    expect(mk('c', { updatedAt: 'x' }).updatedAt).toBeUndefined();
    expect(mk('d', { updatedAt: { toDate: () => { throw new Error('bad'); } } }).updatedAt).toBeUndefined();
    expect(mk('e').updatedAt).toBeUndefined();
  });
});

describe('sitemapEntries', () => {
  const entries = sitemapEntries('https://e.com', [mk('a', { updatedAt: '2026-10-01T10:00:00Z' }), mk('b', { country: 'EG' }), mk('c', { country: '' })]);
  it('keeps the same pages as before', () => {
    expect(entries.map((e) => e.url)).toEqual([
      'https://e.com/', 'https://e.com/country/ae', 'https://e.com/country/eg',
      'https://e.com/p/a', 'https://e.com/p/b', 'https://e.com/p/c', 'https://e.com/privacy', 'https://e.com/terms',
    ]);
  });
  it('gives listing and country pages their language versions', () => {
    const p = entries.find((e) => e.url === 'https://e.com/p/a')!;
    expect(p.alternates?.languages?.fr).toBe('https://e.com/p/a?lang=fr');
    expect(entries.find((e) => e.url === 'https://e.com/country/ae')!.alternates?.languages?.zh).toBe('https://e.com/country/ae?lang=zh');
    expect(entries[0].alternates).toBeUndefined();
  });
  it('shows when a listing last changed, only when known', () => {
    expect(entries.find((e) => e.url === 'https://e.com/p/a')!.lastModified).toEqual(new Date('2026-10-01T10:00:00Z'));
    expect(entries.find((e) => e.url === 'https://e.com/p/b')!.lastModified).toBeUndefined();
  });
});

describe('wiring', () => {
  it('the sitemap route uses the builder', () => {
    expect(readFileSync('app/sitemap.ts', 'utf8')).toContain('sitemapEntries');
  });
});
