import { describe, it, expect } from 'vitest';
import { monthGrid, busyNights, applyPick, inRange, weekStartFor, weekdayLabels, monthLabel, CALENDAR_I18N } from '@/lib/calendar-grid';

describe('monthGrid', () => {
  it('lays out October 2026 (starts on a Thursday)', () => {
    const sun = monthGrid(2026, 9, 0);
    expect(sun[0].slice(0, 4)).toEqual([null, null, null, null]);
    expect(sun[0][4]).toBe('2026-10-01');
    expect(sun.flat().filter(Boolean)).toHaveLength(31);
    expect(sun.every((w) => w.length === 7)).toBe(true);
    const mon = monthGrid(2026, 9, 1);
    expect(mon[0][3]).toBe('2026-10-01');
    const sat = monthGrid(2026, 9, 6);
    expect(sat[0][5]).toBe('2026-10-01');
  });
  it('handles February in a leap year and year changes', () => {
    expect(monthGrid(2028, 1, 0).flat().filter(Boolean)).toHaveLength(29);
    expect(monthGrid(2026, 11, 0).flat().filter(Boolean).pop()).toBe('2026-12-31');
  });
});

describe('busyNights', () => {
  it('keeps the check-out day free', () => {
    const s = busyNights([{ start: '2026-10-05', end: '2026-10-08' }]);
    expect([...s]).toEqual(['2026-10-05', '2026-10-06', '2026-10-07']);
  });
  it('ignores bad ranges', () => {
    expect(busyNights([{ start: 'x', end: '2026-10-08' }, { start: '2026-10-08', end: '2026-10-08' }]).size).toBe(0);
  });
});

describe('applyPick', () => {
  const today = '2026-10-01';
  const taken = busyNights([{ start: '2026-10-10', end: '2026-10-12' }]);
  it('first tap sets check-in, second sets check-out', () => {
    const a = applyPick({ start: '', end: '' }, '2026-10-05', taken, today);
    expect(a).toEqual({ start: '2026-10-05', end: '' });
    expect(applyPick(a, '2026-10-08', taken, today)).toEqual({ start: '2026-10-05', end: '2026-10-08' });
  });
  it('lets the check-out land on the first taken day', () => {
    const a = { start: '2026-10-05', end: '' };
    expect(applyPick(a, '2026-10-10', taken, today)).toEqual({ start: '2026-10-05', end: '2026-10-10' });
  });
  it('does not stretch a stay across taken nights', () => {
    const a = { start: '2026-10-05', end: '' };
    expect(applyPick(a, '2026-10-13', taken, today)).toEqual({ start: '2026-10-13', end: '' });
    expect(applyPick(a, '2026-10-11', taken, today)).toEqual(a);
  });
  it('restarts when tapping before the check-in or after a full range', () => {
    expect(applyPick({ start: '2026-10-05', end: '' }, '2026-10-03', taken, today)).toEqual({ start: '2026-10-03', end: '' });
    expect(applyPick({ start: '2026-10-05', end: '2026-10-08' }, '2026-10-20', taken, today)).toEqual({ start: '2026-10-20', end: '' });
  });
  it('ignores past days and taken days as a start', () => {
    const none = { start: '', end: '' };
    expect(applyPick(none, '2026-09-30', taken, today)).toEqual(none);
    expect(applyPick(none, '2026-10-10', taken, today)).toEqual(none);
  });
});

describe('labels', () => {
  it('week starts and weekday names', () => {
    expect(weekStartFor('ar')).toBe(6);
    expect(weekStartFor('fr')).toBe(1);
    expect(weekStartFor('en')).toBe(0);
    expect(weekdayLabels('en', 0)[0]).toMatch(/Sun/);
    expect(weekdayLabels('en', 1)[0]).toMatch(/Mon/);
    expect(weekdayLabels('ar', 6)).toHaveLength(7);
  });
  it('month names with latin digits', () => {
    for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh']) expect(monthLabel(2026, 9, l)).toMatch(/2026/);
  });
  it('range check and strings', () => {
    expect(inRange('2026-10-06', { start: '2026-10-05', end: '2026-10-08' })).toBe(true);
    expect(inRange('2026-10-09', { start: '2026-10-05', end: '2026-10-08' })).toBe(false);
    expect(inRange('2026-10-06', { start: '2026-10-05', end: '' })).toBe(false);
    expect(Object.keys(CALENDAR_I18N)).toHaveLength(7);
  });
});
