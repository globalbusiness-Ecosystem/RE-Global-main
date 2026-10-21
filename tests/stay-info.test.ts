import { describe, it, expect } from 'vitest';
import { parseStayInfo, stayFacts, formatClock, STAY_I18N } from '@/lib/stay-info';
import { parsePropertyInput } from '@/lib/admin-property';

describe('parseStayInfo', () => {
  it('accepts empty and valid values', () => {
    expect(parseStayInfo({})).toEqual({ ok: true, info: {} });
    expect(parseStayInfo({ checkInTime: '', maxGuests: '' })).toEqual({ ok: true, info: {} });
    expect(parseStayInfo({ checkInTime: '14:00', checkOutTime: '11:30', maxGuests: '4' })).toEqual({ ok: true, info: { checkInTime: '14:00', checkOutTime: '11:30', maxGuests: 4 } });
  });
  it('rejects bad times and guest counts', () => {
    for (const t of ['24:00', '9:00', '12:60', 'noon', 5]) expect(parseStayInfo({ checkInTime: t }).ok).toBe(false);
    for (const g of [0, 51, 2.5, 'x', -1]) expect(parseStayInfo({ maxGuests: g }).ok).toBe(false);
  });
});

describe('stayFacts', () => {
  it('lists only what is set, in 7 languages', () => {
    expect(stayFacts({}, 'en')).toEqual([]);
    expect(stayFacts(null, 'en')).toEqual([]);
    for (const l of Object.keys(STAY_I18N)) expect(stayFacts({ checkInTime: '14:00', checkOutTime: '11:00', maxGuests: 3 }, l)).toHaveLength(3);
    expect(stayFacts({ maxGuests: 3 }, 'en')[0].text).toBe('Up to 3 guests');
  });
  it('ignores malformed stored values', () => {
    expect(stayFacts({ checkInTime: 'x', maxGuests: 0 }, 'en')).toEqual([]);
  });
  it('formats the clock with latin digits', () => {
    expect(formatClock('14:05', 'en')).toMatch(/2:05/);
    expect(formatClock('14:05', 'ar')).toMatch(/2:05/);
    expect(formatClock('bad', 'en')).toBe('bad');
  });
});

describe('admin property input', () => {
  const base = { title: 'H', price: 10, currency: 'Pi', type: 'hotel', propertyType: 'villa', status: 'available' };
  it('stores stay info and rejects invalid values', () => {
    const ok = parsePropertyInput({ ...base, checkInTime: '15:00', maxGuests: 2 });
    expect(ok.ok && ok.doc).toMatchObject({ checkInTime: '15:00', maxGuests: 2 });
    expect(parsePropertyInput({ ...base, checkInTime: '99:99' }).ok).toBe(false);
    const none = parsePropertyInput(base);
    expect(none.ok && 'maxGuests' in none.doc).toBe(false);
  });
});
