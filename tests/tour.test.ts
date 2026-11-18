import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { TOUR_I18N } from '@/lib/tour-i18n';
import { TOUR_KEY, GUIDE_CARD_KEY, isTourDone, markTourDone, isGuideCardHidden, hideGuideCard } from '@/lib/tour';

const src = (p: string) => readFileSync(p, 'utf8');

function fakeStorage(broken = false) {
  const m = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => { if (broken) throw new Error('blocked'); return m.get(k) ?? null; },
    setItem: (k: string, v: string) => { if (broken) throw new Error('blocked'); m.set(k, v); },
  };
  return m;
}

describe('remembered choices', () => {
  beforeEach(() => { fakeStorage(); });
  it('start false and stay true once set, independently', () => {
    expect(isTourDone()).toBe(false);
    expect(isGuideCardHidden()).toBe(false);
    markTourDone();
    expect(isTourDone()).toBe(true);
    expect(isGuideCardHidden()).toBe(false);
    hideGuideCard();
    expect(isGuideCardHidden()).toBe(true);
    expect(TOUR_KEY).not.toBe(GUIDE_CARD_KEY);
  });
  it('does not crash when browser storage is blocked', () => {
    fakeStorage(true);
    expect(isTourDone()).toBe(false);
    expect(() => markTourDone()).not.toThrow();
    expect(() => hideGuideCard()).not.toThrow();
  });
});

describe('tour content', () => {
  it('Arabic and English have the same steps and no empty text', () => {
    expect(TOUR_I18N.ar.steps.map((s) => s.target)).toEqual(TOUR_I18N.en.steps.map((s) => s.target));
    for (const l of ['en', 'ar'] as const) {
      for (const s of TOUR_I18N[l].steps) { expect(s.title.trim()).not.toBe(''); expect(s.text.trim()).not.toBe(''); }
      for (const k of ['next', 'back', 'skip', 'done', 'hideCard', 'replay', 'stepOf'] as const) expect(TOUR_I18N[l][k].trim()).not.toBe('');
    }
  });
  it('every spotlighted part of the app really carries its data-tour mark', () => {
    const all = [src('components/bottom-nav.tsx'), src('components/header.tsx'), src('components/pages/home-page.tsx')].join('\n');
    for (const s of TOUR_I18N.en.steps) {
      if (!s.target) continue;
      const name = /data-tour="([^"]+)"/.exec(s.target)![1];
      const ok = name.startsWith('nav-') ? all.includes('data-tour={`nav-${item.id}`}') : all.includes(`data-tour="${name}"`);
      expect(ok, name).toBe(true);
    }
  });
});

describe('wiring', () => {
  it('the tour starts by itself on the home page, waits for dialogs, and can be skipped', () => {
    expect(src('components/pages/home-page.tsx')).toContain('<AppTour');
    const t = src('components/app-tour.tsx');
    expect(t).toContain('isTourDone()');
    expect(t).toContain('aria-modal="true"]');
    expect(t).toContain("e.key === 'Escape'");
    expect(t).toContain('markTourDone()');
  });
  it('the guide card has a hide button that is remembered, and the guide page can replay the tour', () => {
    const h = src('components/pages/home-page.tsx');
    expect(h).toContain('hideGuideCard()');
    expect(h).toContain('guideCardHidden === false');
    expect(src('components/pages/guide-page.tsx')).toContain('startTour');
  });
});
