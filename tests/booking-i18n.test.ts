import { describe, it, expect } from 'vitest';
import { BOOKING_I18N, bookingErrorText, formatDay, nightsLabel } from '@/lib/booking-i18n';
import { validateBooking } from '@/lib/booking-rules';

const NOW = Date.parse('2026-10-14T12:00:00Z');
describe('booking i18n', () => {
  it('has every string in all 7 languages', () => {
    const keys = Object.keys(BOOKING_I18N.en);
    for (const l of Object.keys(BOOKING_I18N)) {
      for (const k of keys) expect((BOOKING_I18N as any)[l][k], `${l}.${k}`).toBeTruthy();
    }
    expect(Object.keys(BOOKING_I18N)).toHaveLength(7);
  });
  it('validateBooking returns a code and limit', () => {
    expect(validateBooking('hotel', {}, NOW)).toMatchObject({ ok: false, code: 'invalid' });
    expect(validateBooking('hotel', { start: '2026-10-20', end: '2026-10-20' }, NOW)).toMatchObject({ ok: false, code: 'min', limit: 1 });
    expect(validateBooking('hotel', { start: '2026-10-20', end: '2027-01-20' }, NOW)).toMatchObject({ ok: false, code: 'max', limit: 60 });
    expect(validateBooking('hotel', { start: '2026-01-01', end: '2026-01-03' }, NOW)).toMatchObject({ ok: false, code: 'past' });
  });
  it('localizes errors with the limit', () => {
    expect(bookingErrorText('fr', 'max', 60)).toContain('60');
    expect(bookingErrorText('ar', 'min', 30)).toContain('30');
    expect(bookingErrorText('xx', 'invalid')).toBe(BOOKING_I18N.en.invalid);
  });
  it('formats days with latin digits in every language', () => {
    for (const l of ['en', 'ar', 'ur', 'zh', 'fr', 'es', 'pt']) expect(formatDay('2026-10-20', l)).toMatch(/20/);
    expect(formatDay('bad', 'en')).toBe('bad');
  });
  it('pluralizes nights', () => {
    expect(nightsLabel('en', 1)).toBe('1 night');
    expect(nightsLabel('en', 3)).toBe('3 nights');
  });
});
