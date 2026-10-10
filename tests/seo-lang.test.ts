import { describe, it, expect, afterEach } from 'vitest';
import { pickLanguage, isNavLanguage } from '@/lib/detect-language';
import { siteUrl } from '@/lib/site-url';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
});

describe('pickLanguage', () => {
  it('prefers a valid saved choice', () => {
    expect(pickLanguage('fr', ['ar'])).toBe('fr');
  });
  it('ignores garbage in storage and uses the browser language', () => {
    expect(pickLanguage('klingon', ['ar-EG', 'en'])).toBe('ar');
    expect(pickLanguage(null, ['pt-BR'])).toBe('pt');
    expect(pickLanguage(undefined, ['de-DE', 'zh-CN'])).toBe('zh');
  });
  it('falls back to English', () => {
    expect(pickLanguage(null, ['de', 'ja'])).toBe('en');
    expect(pickLanguage(null, [])).toBe('en');
    expect(pickLanguage(42 as unknown)).toBe('en');
  });
  it('isNavLanguage only accepts supported codes', () => {
    expect(isNavLanguage('ur')).toBe(true);
    expect(isNavLanguage('xx')).toBe(false);
  });
});

describe('siteUrl', () => {
  it('uses NEXT_PUBLIC_BASE_URL, normalised to an origin', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com/some/path/';
    expect(siteUrl()).toBe('https://example.com');
  });
  it('adds https when the scheme is missing and handles junk', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'example.org';
    expect(siteUrl()).toBe('https://example.org');
    process.env.NEXT_PUBLIC_BASE_URL = 'http://';
    expect(siteUrl()).toBe('https://re-global-main.vercel.app');
  });
  it('falls back to the Vercel production URL, then the known deployment', () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'my-app.vercel.app';
    expect(siteUrl()).toBe('https://my-app.vercel.app');
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(siteUrl()).toBe('https://re-global-main.vercel.app');
  });
});

describe('robots + sitemap', () => {
  it('keeps /api and /admin out of search and points to the sitemap', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule.disallow).toEqual(['/api/', '/admin']);
    expect(r.sitemap).toBe('https://example.com/sitemap.xml');
  });
  it('lists only public routes with absolute URLs', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    const urls = sitemap().map((s) => s.url);
    expect(urls).toEqual(['https://example.com/', 'https://example.com/privacy', 'https://example.com/terms']);
  });
});
