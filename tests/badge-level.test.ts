import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BADGE_COLORS, BADGE_THRESHOLDS, badgeLevelFor, badgeLevelLabel, badgeLevelName, parseBadgeLevel, pointsToNextBadge } from '@/lib/badge-level';
import { parseFounderUids } from '@/lib/founder-accounts';

const src = (p: string) => readFileSync(p, 'utf8');

describe('badge levels', () => {
  it('has 7 levels, 7 different colours, rising thresholds', () => {
    expect(BADGE_THRESHOLDS).toHaveLength(7);
    expect(new Set(Object.values(BADGE_COLORS).map((c) => c.main)).size).toBe(7);
    for (let i = 1; i < 7; i++) expect(BADGE_THRESHOLDS[i]).toBeGreaterThan(BADGE_THRESHOLDS[i - 1]);
  });
  it('maps points to a level', () => {
    expect(badgeLevelFor(0)).toBe(1);
    expect(badgeLevelFor(99)).toBe(1);
    expect(badgeLevelFor(100)).toBe(2);
    expect(badgeLevelFor(1500)).toBe(5);
    expect(badgeLevelFor(6000)).toBe(7);
    expect(badgeLevelFor(10 ** 9)).toBe(7);
    expect(badgeLevelFor(-5)).toBe(1);
    expect(badgeLevelFor(NaN)).toBe(1);
    expect(badgeLevelFor('x')).toBe(1);
  });
  it('points to next level', () => {
    expect(pointsToNextBadge(0)).toBe(100);
    expect(pointsToNextBadge(250)).toBe(50);
    expect(pointsToNextBadge(7000)).toBeNull();
  });
  it('names exist in every language', () => {
    for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh']) for (let i = 1; i <= 7; i++) expect(badgeLevelName(i as any, l).length).toBeGreaterThan(0);
    expect(badgeLevelLabel(7, 'en')).toBe('Level 7 · Ruby');
  });
  it('parseBadgeLevel is safe', () => {
    expect(parseBadgeLevel(9)).toBe(1);
    expect(parseBadgeLevel('3')).toBe(1);
    expect(parseBadgeLevel(4)).toBe(4);
  });
  it('is wired into the seal, rewards endpoint and settings', () => {
    expect(src('components/verified-badge.tsx')).toContain('BADGE_COLORS');
    expect(src('lib/rewards-server.ts')).toContain('badgeLevel');
    expect(src('components/pages/settings-page.tsx')).toContain('level={shownLevel}');
  });
});

describe('founder accounts', () => {
  it('reads a list and the old single uid, without duplicates', () => {
    expect(parseFounderUids({ uid: 'a' })).toEqual(['a']);
    expect(parseFounderUids({ uids: ['a', 'b'], uid: 'a' })).toEqual(['a', 'b']);
    expect(parseFounderUids(null)).toEqual([]);
    expect(parseFounderUids({ uids: [1, '', 'x'.repeat(300), 'ok'] })).toEqual(['ok']);
    expect(parseFounderUids({ uids: ['1', '2', '3', '4', '5', '6', '7'] })).toHaveLength(5);
  });
  it('is checked by membership on the server', () => {
    expect(src('lib/founder-server.ts')).toContain('.includes(uid)');
  });
});
