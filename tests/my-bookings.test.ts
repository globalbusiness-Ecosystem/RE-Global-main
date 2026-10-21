import { describe, it, expect } from 'vitest';
import { bookingPhase, daysUntil, buildIcs, countdownText, MY_BOOKING_I18N } from '@/lib/my-bookings';

describe('bookingPhase', () => {
  it('classifies a stay against today', () => {
    expect(bookingPhase('2026-10-25', '2026-10-28', '2026-10-20')).toBe('upcoming');
    expect(bookingPhase('2026-10-20', '2026-10-28', '2026-10-20')).toBe('current');
    expect(bookingPhase('2026-10-18', '2026-10-28', '2026-10-20')).toBe('current');
    expect(bookingPhase('2026-10-15', '2026-10-20', '2026-10-20')).toBe('past');
    expect(bookingPhase('2026-10-01', '2026-10-05', '2026-10-20')).toBe('past');
  });
});

describe('daysUntil / countdown', () => {
  it('counts whole days', () => {
    expect(daysUntil('2026-10-25', '2026-10-20')).toBe(5);
    expect(daysUntil('2026-10-20', '2026-10-20')).toBe(0);
    expect(daysUntil('bad', '2026-10-20')).toBeNull();
  });
  it('words the countdown in every language', () => {
    expect(countdownText('en', 0)).toBe('Check-in today');
    expect(countdownText('en', 1)).toBe('Check-in tomorrow');
    expect(countdownText('en', 5)).toBe('Check-in in 5 days');
    expect(countdownText('en', -2)).toBe('');
    expect(countdownText('en', null)).toBe('');
    for (const l of Object.keys(MY_BOOKING_I18N)) expect(countdownText(l, 7)).toContain('7');
  });
  it('has every string in all 7 languages', () => {
    const keys = Object.keys(MY_BOOKING_I18N.en);
    for (const l of Object.keys(MY_BOOKING_I18N)) for (const k of keys) expect((MY_BOOKING_I18N as any)[l][k], `${l}.${k}`).toBeTruthy();
  });
});

describe('buildIcs', () => {
  const now = '2026-10-20T12:30:45.123Z';
  it('writes an all-day event with CRLF lines', () => {
    const ics = buildIcs({ id: 'abc123', propertyTitle: 'Nile, View; Suite', start: '2026-10-25', end: '2026-10-28', nights: 3 }, now) as string;
    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261025\r\n');
    expect(ics).toContain('DTEND;VALUE=DATE:20261028\r\n');
    expect(ics).toContain('DTSTAMP:20261020T123045Z\r\n');
    expect(ics).toContain('SUMMARY:Nile\\, View\\; Suite\r\n');
    expect(ics).toContain('UID:abc123@re-global\r\n');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
  it('folds long lines and rejects bad dates', () => {
    const ics = buildIcs({ id: 'x', propertyTitle: 'A'.repeat(200), start: '2026-10-25', end: '2026-10-26' }, now) as string;
    for (const line of ics.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75);
    expect(buildIcs({ id: 'x', propertyTitle: 't', start: 'nope', end: '2026-10-26' }, now)).toBeNull();
  });
});
