import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ABOUT_I18N } from '@/lib/about-i18n';
import { NAV_DICTIONARY } from '@/lib/nav-i18n';
import { flattenTexts, isTextPage } from '@/lib/site-texts';
import { parseAbout, parseEmail, parseWhatsapp } from '@/lib/about-settings';
import { parseLockImage } from '@/lib/lock-image';

const src = (p: string) => readFileSync(p, 'utf8');
const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('About page texts', () => {
  it('every language has the same lines, none empty', () => {
    const base = Object.keys(flattenTexts(ABOUT_I18N.en)).sort();
    expect(base.length).toBeGreaterThan(20);
    for (const l of LANGS) {
      const flat = flattenTexts(ABOUT_I18N[l]);
      expect(Object.keys(flat).sort(), l).toEqual(base);
      for (const [k, v] of Object.entries(flat)) expect(v.trim().length, `${l}.${k}`).toBeGreaterThan(0);
    }
  });
  it('the menu label exists in all 7 languages', () => {
    for (const l of LANGS) expect(NAV_DICTIONARY[l].about.trim().length, l).toBeGreaterThan(0);
  });
  it('the admin can edit the page texts', () => expect(isTextPage('about')).toBe(true));
});

describe('About settings and lock image parsing', () => {
  it('accepts only safe values', () => {
    expect(parseAbout({ coverUrl: 'https://x.test/a.webp', email: 'a@b.com', website: 'https://b.com', whatsapp: '+20 100 123 4567' })).toEqual({ coverUrl: 'https://x.test/a.webp', email: 'a@b.com', website: 'https://b.com/', whatsapp: '201001234567' });
    expect(parseAbout({ coverUrl: 'http://x.test/a.webp', website: 'javascript:alert(1)', email: 'not an email', whatsapp: 'abc' })).toEqual({ coverUrl: null, email: null, website: null, whatsapp: null });
    expect(parseEmail('a@b.com<script>')).toBeNull();
    expect(parseWhatsapp('123')).toBeNull();
  });
  it('the lock image must be an https address', () => {
    expect(parseLockImage({ imageUrl: 'https://x.test/k.webp' }).imageUrl).toBe('https://x.test/k.webp');
    for (const bad of ['http://x.test/k.webp', 'data:image/png;base64,AAAA', 'javascript:1', 5, null]) expect(parseLockImage({ imageUrl: bad }).imageUrl).toBeNull();
  });
});

describe('wiring', () => {
  it('admin routes are guarded and audited, public routes are rate limited', () => {
    for (const f of ['app/api/admin/about/route.ts', 'app/api/admin/lock-image/route.ts']) { expect(src(f)).toMatch(/isAdminRequest/); expect(src(f)).toMatch(/logAdmin\(/); }
    for (const f of ['app/api/about/route.ts', 'app/api/lock-image/route.ts']) expect(src(f)).toMatch(/ipLimited\(/);
  });
  it('the fingerprint button shows the admin picture when one is set', () => {
    const s = src('components/fingerprint-scanner.tsx');
    expect(s).toMatch(/useLockImage\(\)/);
    expect(s).toMatch(/imageUrl \?/);
  });
  it('the logo tab has the picture control, the content tab has the About section', () => {
    expect(src('components/admin/properties-tab.tsx')).toMatch(/<LockImageSettings/);
    const c = src('components/admin/content-tab.tsx');
    expect(c).toMatch(/<AboutSettingsPanel/);
    expect(c).toMatch(/initialPage="about"/);
  });
  it('the page is reachable from the menu', () => {
    expect(src('components/header.tsx')).toMatch(/id: 'about'/);
    const p = src('app/page.tsx');
    expect(p).toMatch(/case 'about':/);
    expect(p).toMatch(/<AboutPage /);
  });
});
