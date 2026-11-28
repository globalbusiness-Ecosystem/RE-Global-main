import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

describe('admin on a laptop', () => {
  const page = read('app/admin/page.tsx');
  it('the side menu stays in view while a long page scrolls', () => {
    expect(page).toMatch(/<aside[^>]*md:sticky md:top-0[^>]*md:h-screen[^>]*md:overflow-y-auto/);
  });
  it('the content uses the wider screen instead of a narrow strip', () => {
    expect(page).toContain('xl:max-w-6xl 2xl:max-w-7xl');
  });
  it('the sub-section bar wraps on a laptop (no sideways swipe) and still scrolls on a phone', () => {
    const s = read('components/admin/sub-tabs.tsx');
    expect(s).toContain('overflow-x-auto');
    expect(s).toContain('md:static md:flex-wrap md:overflow-visible');
  });
  it('both menus have a name for screen readers and mark the open section', () => {
    expect(page).toContain("aria-label={tr('sidebarAria', lang)}");
    expect(page).toContain("aria-label={tr('sectionsAria', lang)}");
    expect(page).toContain("aria-label={tr('bottomAria', lang)}");
    expect(page.match(/aria-current=\{tab === t\.id \? 'page' : undefined\}/g)?.length).toBe(2);
  });
});
