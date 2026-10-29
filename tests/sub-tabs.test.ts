import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { pickTab, stepTab, keyTab } from '@/lib/sub-tabs';

const ids = ['a', 'b', 'c'];

describe('pickTab', () => {
  it('keeps a valid saved tab', () => expect(pickTab(ids, 'b')).toBe('b'));
  it('falls back to the first tab', () => {
    expect(pickTab(ids, 'zzz')).toBe('a');
    expect(pickTab(ids, null)).toBe('a');
    expect(pickTab(ids, undefined)).toBe('a');
  });
  it('handles an empty list', () => expect(pickTab([], 'a')).toBe(''));
});

describe('stepTab', () => {
  it('wraps both ways', () => {
    expect(stepTab(ids, 'c', 1)).toBe('a');
    expect(stepTab(ids, 'a', -1)).toBe('c');
  });
  it('starts from the first tab when current is unknown', () => expect(stepTab(ids, 'x', 1)).toBe('b'));
  it('handles an empty list', () => expect(stepTab([], 'a', 1)).toBe(''));
});

describe('keyTab', () => {
  it('flips arrows in right-to-left pages', () => {
    expect(keyTab(ids, 'b', 'ArrowLeft', true)).toBe('c');
    expect(keyTab(ids, 'b', 'ArrowRight', true)).toBe('a');
    expect(keyTab(ids, 'b', 'ArrowRight', false)).toBe('c');
    expect(keyTab(ids, 'b', 'ArrowLeft', false)).toBe('a');
  });
  it('supports Home and End and ignores other keys', () => {
    expect(keyTab(ids, 'b', 'Home', true)).toBe('a');
    expect(keyTab(ids, 'b', 'End', true)).toBe('c');
    expect(keyTab(ids, 'b', 'Enter', true)).toBeNull();
  });
});

describe('admin tabs wiring', () => {
  const read = (p: string) => readFileSync(p, 'utf8');
  it('payments tab mounts every panel exactly once', () => {
    const s = read('components/admin/payments-tab.tsx');
    for (const n of ['PayoutsPanel', 'BookingsPanel', 'BlockDates', 'ReviewsPanel', 'CancellationSettings', 'OccupancyPanel', 'ArrivalsPanel', 'HoldingsPanel', 'MarketAdminPanel', 'MarketFeeSettings', 'PaymentsList']) {
      expect(s.split(`<${n} `).length - 1, n).toBe(1);
    }
  });
  it('dashboard tab mounts every monitoring panel exactly once', () => {
    const s = read('components/admin/dashboard-tab.tsx');
    for (const n of ['ActivityLog', 'CspPanel', 'ListingReportsPanel', 'ClientErrorsPanel', 'BackupPanel', 'RevokeSessions']) {
      expect(s.split(`<${n} `).length - 1, n).toBe(1);
    }
  });
});

describe('properties tab wiring', () => {
  it('has a list tab and a display-settings tab', () => {
    const s = readFileSync('components/admin/properties-tab.tsx', 'utf8');
    expect(s).toContain("storeKey=\"properties\"");
    expect(s.split('<DisplaySettings ').length - 1).toBe(1);
    expect(s).toContain("id: 'list'");
    expect(s).toContain("id: 'display'");
  });
});
