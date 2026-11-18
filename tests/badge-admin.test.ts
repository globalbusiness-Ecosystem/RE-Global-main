import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BADGE_THRESHOLDS, badgeLevelFor, parseThresholds, pointsToNextBadge } from '@/lib/badge-level';
import { parseFounder, DEFAULT_FOUNDER } from '@/lib/founder';
import { LADDER_I18N } from '@/lib/badge-ladder-i18n';

const src = (p: string) => readFileSync(p, 'utf8');

describe('admin thresholds', () => {
  it('accepts seven rising whole numbers starting at 0', () => {
    expect(parseThresholds([0, 10, 20, 30, 40, 50, 60])).toEqual([0, 10, 20, 30, 40, 50, 60]);
    expect(parseThresholds(['0', '5', '6', '7', '8', '9', '10'])).toEqual([0, 5, 6, 7, 8, 9, 10]);
    expect(parseThresholds([...BADGE_THRESHOLDS])).toEqual([...BADGE_THRESHOLDS]);
  });
  it('rejects anything else', () => {
    expect(parseThresholds([0, 10, 20])).toBeNull();
    expect(parseThresholds([1, 10, 20, 30, 40, 50, 60])).toBeNull();
    expect(parseThresholds([0, 10, 10, 30, 40, 50, 60])).toBeNull();
    expect(parseThresholds([0, 10, 5, 30, 40, 50, 60])).toBeNull();
    expect(parseThresholds([0, 1.5, 20, 30, 40, 50, 60])).toBeNull();
    expect(parseThresholds([0, 10, 20, 30, 40, 50, 10 ** 9])).toBeNull();
    expect(parseThresholds(null)).toBeNull();
    expect(parseThresholds([0, '', 20, 30, 40, 50, 60])).toBeNull();
  });
  it('levels follow custom thresholds', () => {
    const t = [0, 10, 20, 30, 40, 50, 60];
    expect(badgeLevelFor(35, t)).toBe(4);
    expect(badgeLevelFor(60, t)).toBe(7);
    expect(pointsToNextBadge(35, t)).toBe(5);
    expect(pointsToNextBadge(100, t)).toBeNull();
  });
});

describe('founder badge level', () => {
  it('defaults to 7 and only accepts 1 to 7', () => {
    expect(DEFAULT_FOUNDER.badgeLevel).toBe(7);
    expect(parseFounder({}).badgeLevel).toBe(7);
    expect(parseFounder({ badgeLevel: 4 }).badgeLevel).toBe(4);
    expect(parseFounder({ badgeLevel: 9 }).badgeLevel).toBe(7);
    expect(parseFounder({ badgeLevel: 2.5 }).badgeLevel).toBe(7);
    expect(parseFounder({ badgeLevel: '3' }).badgeLevel).toBe(7);
  });
  it('is shown on the About card and settings, and editable in admin', () => {
    expect(src('components/founder-card.tsx')).toContain('level={f.badgeLevel}');
    expect(src('components/pages/settings-page.tsx')).toContain('founderInfo.badgeLevel');
    expect(src('components/admin/founder-settings.tsx')).toContain('founder-badge-level');
    expect(src('app/api/admin/founder/route.ts')).toContain("'badgeLevel'");
  });
});

describe('level ladder and admin wiring', () => {
  it('the rewards tab has the ladder window with all languages', () => {
    expect(src('components/rewards-panel.tsx')).toContain('<BadgeLadder');
    expect(src('components/badge-ladder.tsx')).toContain('role="dialog"');
    for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh']) expect((LADDER_I18N as any)[l].title.length).toBeGreaterThan(0);
  });
  it('the thresholds API is admin-only and the rewards endpoint uses it', () => {
    const r = src('app/api/admin/badges/route.ts');
    expect(r.match(/isAdminRequest/g)!.length).toBeGreaterThanOrEqual(2);
    expect(src('lib/rewards-server.ts')).toContain('getBadgeThresholds');
    expect(src('components/admin/content-tab.tsx')).toContain('<BadgeSettings');
  });
});
