import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { COVERS, coverCss, isCoverId } from '@/lib/cover';

const src = (p: string) => readFileSync(p, 'utf8');

describe('brand look and profile cover', () => {
  it('has a safe cover list and falls back to the first one', () => {
    expect(COVERS.length).toBeGreaterThanOrEqual(4);
    expect(isCoverId('aurora')).toBe(true);
    expect(isCoverId('<script>')).toBe(false);
    expect(coverCss('nope')).toBe(coverCss(COVERS[0].id));
  });
  it('every language names the cover section', () => {
    const s = src('lib/avatar.ts');
    expect((s.match(/cover: '/g) ?? []).length).toBe(7);
  });
  it('the dark tokens are the violet and gold set, and the page is not painted flat black over them', () => {
    const css = src('app/globals.css');
    expect(css).toContain('RE brand look');
    expect(css).toContain('--secondary: oklch(0.62 0.2 295)');
    expect(src('components/pages/home-page.tsx')).not.toContain('relative z-10 bg-black');
    expect(src('components/header.tsx')).not.toContain('"bg-black h-12');
  });
  it('Settings shows the cover banner and a visible change-picture button', () => {
    const s = src('components/pages/settings-page.tsx');
    expect(s).toContain('coverCss(cover)');
    expect(s).toContain('setPickerOpen(true)');
  });
});

describe('sign-in and identity-check pages share the brand look', () => {
  it('show the RE mark and use the gold accent for the main action', () => {
    for (const p of ['app/login/page.tsx', 'app/kyc/page.tsx']) {
      const s = src(p);
      expect(s).toContain('<BrandMark />');
      expect(s).not.toContain('focus:border-white/40');
    }
    expect(src('app/kyc/page.tsx')).not.toContain('bg-white px-4 py-3');
  });
});
