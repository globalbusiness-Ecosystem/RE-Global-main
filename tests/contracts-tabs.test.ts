import { describe, it, expect } from 'vitest';
import { TAB_LABELS, NO_ASSETS, visibleTabs, safeTab } from '@/lib/contracts-tabs';
import { SEO_LANGS } from '@/lib/seo-i18n';

describe('contracts tabs', () => {
  it('shows only Contracts when the guest has nothing else (no empty tabs)', () => {
    expect(visibleTabs(NO_ASSETS)).toEqual(['contracts']);
  });
  it('adds a tab for each section that has items, Contracts first, in a fixed order', () => {
    expect(visibleTabs({ bookings: 6, properties: 5, shares: 13, owed: 9 })).toEqual(['contracts', 'bookings', 'properties', 'shares', 'owed']);
    expect(visibleTabs({ bookings: 0, properties: 2, shares: 0, owed: 1 })).toEqual(['contracts', 'properties', 'owed']);
  });
  it('falls back to Contracts when the open tab empties out', () => {
    expect(safeTab('shares', { ...NO_ASSETS, shares: 3 })).toBe('shares');
    expect(safeTab('shares', NO_ASSETS)).toBe('contracts');
    expect(safeTab('contracts', NO_ASSETS)).toBe('contracts');
  });
  it('has a label for every tab in every language', () => {
    for (const l of SEO_LANGS) for (const id of ['contracts', 'bookings', 'properties', 'shares', 'owed'] as const) {
      expect(TAB_LABELS[l][id].length, `${l}.${id}`).toBeGreaterThan(1);
    }
  });
});
