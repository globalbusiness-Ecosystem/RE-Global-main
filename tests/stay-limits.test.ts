import { describe, it, expect, vi } from 'vitest';

let doc: { exists: boolean; data: () => Record<string, unknown> } = { exists: false, data: () => ({}) };
vi.mock('@/lib/firebase-admin', () => ({ adminDb: { collection: () => ({ doc: () => ({ get: async () => doc }) }) } }));
vi.mock('@/lib/pricing', () => ({ getPiUsdRate: async () => 2 }));

import { stayLimits, validateBooking } from '@/lib/booking-rules';
import { parseStayInfo, stayFacts, STAY_I18N } from '@/lib/stay-info';
import { parsePropertyInput } from '@/lib/admin-property';
import { resolveExpected, BookingInputError } from '@/lib/property-price';

const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

describe('stayLimits', () => {
  it('keeps the platform range when nothing is set', () => {
    expect(stayLimits('hotel')).toEqual({ min: 1, max: 60 });
    expect(stayLimits('hotel', {})).toEqual({ min: 1, max: 60 });
    expect(stayLimits('rent', { minNights: 3, maxNights: 5 })).toEqual({ min: 30, max: 365 });
  });
  it('narrows a hotel range', () => {
    expect(stayLimits('hotel', { minNights: 2, maxNights: 14 })).toEqual({ min: 2, max: 14 });
    expect(stayLimits('hotel', { minNights: '3' })).toEqual({ min: 3, max: 60 });
    expect(stayLimits('hotel', { maxNights: 7 })).toEqual({ min: 1, max: 7 });
  });
  it('ignores values that are invalid or outside the platform range', () => {
    expect(stayLimits('hotel', { minNights: 0, maxNights: 99 })).toEqual({ min: 1, max: 60 });
    expect(stayLimits('hotel', { minNights: 'x', maxNights: 2.5 })).toEqual({ min: 1, max: 60 });
    expect(stayLimits('hotel', { minNights: 10, maxNights: 5 })).toEqual({ min: 10, max: 60 });
  });
  it('returns undefined for types without bookings', () => expect(stayLimits('buy', { minNights: 2 })).toBeUndefined());
});

describe('validateBooking with limits', () => {
  const now = Date.now();
  it('enforces the listing minimum and maximum', () => {
    const limits = { min: 2, max: 5 };
    const one = validateBooking('hotel', { start: day(3), end: day(4) }, now, { limits });
    expect(one).toMatchObject({ ok: false, code: 'min', limit: 2 });
    expect(validateBooking('hotel', { start: day(3), end: day(5) }, now, { limits }).ok).toBe(true);
    expect(validateBooking('hotel', { start: day(3), end: day(10) }, now, { limits })).toMatchObject({ ok: false, code: 'max', limit: 5 });
  });
  it('still uses the platform range without limits', () => {
    expect(validateBooking('hotel', { start: day(3), end: day(4) }, now).ok).toBe(true);
  });
});

describe('parseStayInfo nights', () => {
  it('accepts empty and valid values', () => {
    expect(parseStayInfo({ minNights: '', maxNights: '' })).toEqual({ ok: true, info: {} });
    expect(parseStayInfo({ minNights: '2', maxNights: 14 })).toEqual({ ok: true, info: { minNights: 2, maxNights: 14 } });
  });
  it('rejects bad numbers and min above max', () => {
    for (const v of [0, 61, 1.5, 'x', -2]) expect(parseStayInfo({ minNights: v }).ok).toBe(false);
    expect(parseStayInfo({ minNights: 9, maxNights: 3 }).ok).toBe(false);
  });
});

describe('stayFacts nights', () => {
  it('shows only real restrictions, in 7 languages', () => {
    expect(stayFacts({ minNights: 1, maxNights: 60 }, 'en')).toEqual([]);
    for (const l of Object.keys(STAY_I18N)) expect(stayFacts({ minNights: 2, maxNights: 14 }, l)).toHaveLength(2);
    expect(stayFacts({ minNights: 3 }, 'en')[0].text).toBe('Minimum stay: 3 nights');
    expect(stayFacts({ maxNights: 14 }, 'en')[0].text).toBe('Maximum stay: 14 nights');
  });
});

describe('admin property input', () => {
  const base = { title: 'Nile Hotel', location: 'Cairo', price: 10, currency: 'Pi', propertyType: 'apartment', status: 'available', minNights: '2', maxNights: '10' };
  it('keeps nights on hotels', () => {
    const r = parsePropertyInput({ ...base, type: 'hotel' });
    expect(r.ok && r.doc).toMatchObject({ minNights: 2, maxNights: 10 });
  });
  it('drops nights on other types', () => {
    const r = parsePropertyInput({ ...base, type: 'rent' });
    expect(r.ok && 'minNights' in r.doc).toBe(false);
  });
  it('rejects min above max', () => {
    expect(parsePropertyInput({ ...base, type: 'hotel', minNights: 9, maxNights: 3 }).ok).toBe(false);
  });
});

describe('server pricing uses the listing limits', () => {
  it('rejects a stay shorter than the listing minimum', async () => {
    doc = { exists: true, data: () => ({ type: 'hotel', price: 10, currency: 'Pi', minNights: 3 }) };
    await expect(resolveExpected('h1', { booking: { start: day(5), end: day(7) } })).rejects.toBeInstanceOf(BookingInputError);
    const ok = await resolveExpected('h1', { booking: { start: day(5), end: day(8) } });
    expect(ok.amount).toBe(30);
  });
  it('rejects a stay longer than the listing maximum', async () => {
    doc = { exists: true, data: () => ({ type: 'hotel', price: 10, currency: 'Pi', maxNights: 4 }) };
    await expect(resolveExpected('h1', { booking: { start: day(5), end: day(12) } })).rejects.toBeInstanceOf(BookingInputError);
  });
  it('leaves hotels without limits on the platform range', async () => {
    doc = { exists: true, data: () => ({ type: 'hotel', price: 10, currency: 'Pi', maxNights: undefined }) };
    expect((await resolveExpected('h1', { booking: { start: day(5), end: day(6) } })).amount).toBe(10);
  });
});
