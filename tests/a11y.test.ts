import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { needsCloseLabel } from '@/lib/a11y';
import { A11Y_I18N } from '@/lib/a11y-i18n';

const read = (p: string) => readFileSync(p, 'utf8');

describe('needsCloseLabel', () => {
  it('labels icon-only and glyph-only close buttons', () => {
    expect(needsCloseLabel({ text: '✕', hasName: false, hasCloseIcon: false })).toBe(true);
    expect(needsCloseLabel({ text: '  ×  ', hasName: false, hasCloseIcon: false })).toBe(true);
    expect(needsCloseLabel({ text: '', hasName: false, hasCloseIcon: true })).toBe(true);
  });
  it('leaves named buttons and other buttons alone', () => {
    expect(needsCloseLabel({ text: '✕', hasName: true, hasCloseIcon: false })).toBe(false);
    expect(needsCloseLabel({ text: 'Save', hasName: false, hasCloseIcon: false })).toBe(false);
    expect(needsCloseLabel({ text: '', hasName: false, hasCloseIcon: false })).toBe(false);
    expect(needsCloseLabel({ text: 'Exit', hasName: false, hasCloseIcon: true })).toBe(false);
  });
});

describe('texts', () => {
  it('every language has both texts', () => {
    for (const lang of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const) {
      expect(A11Y_I18N[lang].skip.trim().length).toBeGreaterThan(2);
      expect(A11Y_I18N[lang].close.trim().length).toBeGreaterThan(1);
    }
  });
});

describe('page setup', () => {
  it('lets visitors zoom the page', () => {
    const layout = read('app/layout.tsx');
    expect(layout).not.toMatch(/maximumScale|userScalable/);
  });
  it('has a skip link target and no nested main landmark', () => {
    expect(read('components/app-wrapper.tsx')).toContain('id="main-content"');
    expect(read('components/error-view.tsx')).not.toContain('<main');
  });
  it('shows keyboard focus and respects reduced motion', () => {
    const css = read('app/globals.css');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion');
  });
});
