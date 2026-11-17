import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { GUIDE_I18N } from '@/lib/guide-i18n';
import { isTextPage, flattenTexts } from '@/lib/site-texts';
import { NAV_DICTIONARY } from '@/lib/nav-i18n';

const src = (p: string) => readFileSync(p, 'utf8');

describe('getting started guide', () => {
  it('Arabic and English have the same shape and no empty text', () => {
    const en = flattenTexts(GUIDE_I18N.en), ar = flattenTexts(GUIDE_I18N.ar);
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
    for (const v of [...Object.values(en), ...Object.values(ar)]) expect(String(v).trim().length).toBeGreaterThan(0);
  });
  it('never promises returns or says staff ask for secrets', () => {
    const all = JSON.stringify(GUIDE_I18N.en).toLowerCase();
    expect(all).not.toMatch(/risk-free profit|you will earn|guaranteed to/);
    expect(all).toContain('no guaranteed returns');
    expect(all).toContain('never ask');
  });
  it('every language has a menu label and the admin can edit the texts', () => {
    for (const l of Object.keys(NAV_DICTIONARY)) expect((NAV_DICTIONARY as any)[l].guide).toBeTruthy();
    expect(isTextPage('guide')).toBe(true);
    expect(src('components/admin/texts-editor.tsx')).toContain('GUIDE_I18N');
  });
  it('is reachable from the menu, the home page and the announcements, and links to verification', () => {
    expect(src('components/header.tsx')).toMatch(/id: 'guide'/);
    expect(src('app/page.tsx')).toMatch(/case 'guide':/);
    expect(src('components/pages/home-page.tsx')).toContain("onCategoryClick?.('guide')");
    expect(src('lib/announcements.ts')).toContain("'guide'");
    expect(src('components/pages/guide-page.tsx')).toContain('href="/kyc"');
  });
});
