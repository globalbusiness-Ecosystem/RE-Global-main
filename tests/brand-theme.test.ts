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

describe('dashboard and profile layout on a phone', () => {
  it('shows big portfolio values in short form so they never get cut off', () => {
    const s = src('components/pages/dashboard-page.tsx');
    expect(s).toContain('formatCompact(portfolioValue, language)');
    expect(s).toContain('truncate');
  });
  it('stacks e-mail and phone on narrow screens and lets the glow show behind pages', () => {
    expect(src('components/pages/profile-page.tsx')).toContain('grid-cols-1 sm:grid-cols-2');
    expect(src('app/globals.css')).toContain('.dark main.bg-background');
  });
});

import { readFileSync as rf } from 'node:fs'
describe('light mode really works', () => {
  it('does not force dark on body or page', () => {
    expect(rf('app/layout.tsx', 'utf8')).not.toMatch(/<body[^>]*className="dark"/)
    expect(rf('app/page.tsx', 'utf8')).not.toMatch(/classList\.add\(['"]dark['"]\)/)
  })
  it('has light tokens', () => {
    expect(rf('app/globals.css', 'utf8')).toContain(':root:not(.dark)')
  })
})

describe('the last screens follow the platform look', () => {
  it('Aladdin chat, voice chat and the shares market use theme tokens, not fixed browns or ambers', () => {
    for (const f of ['components/ai-advisor-chat.tsx', 'components/ai-advisor-voice-chat.tsx', 'app/market/page.tsx']) {
      const s = rf(f, 'utf8');
      expect(s, f).not.toMatch(/#F59E0B|#2a1f15|#1a1410|amber-[0-9]|slate-[0-9]/);
    }
    expect(rf('app/market/page.tsx', 'utf8')).not.toContain('bg-black text-white');
  });
  it('the contracts page has no "view all" lock button or PIN prompt any more', () => {
    const s = rf('components/pages/contracts-page.tsx', 'utf8');
    expect(s).not.toContain('viewAll');
    expect(s).not.toContain('showPinPrompt');
    expect(s).not.toContain('/api/admin-auth');
  });
});
