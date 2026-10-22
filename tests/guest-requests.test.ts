import { describe, it, expect, vi, beforeEach } from 'vitest';

type Doc = Record<string, unknown>;
const store: Record<string, Record<string, Doc>> = {};
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      get: async () => ({ docs: Object.entries(store[name] ?? {}).map(([id, d]) => ({ id, data: () => d })) }),
      doc: (id: string) => ({
        get: async () => ({ exists: !!store[name]?.[id], data: () => store[name]?.[id] }),
        update: async (d: Doc) => { store[name][id] = { ...store[name][id], ...d }; },
      }),
    }),
  },
}));

import { cleanRequest, canEditRequest, REQUEST_I18N, REQUEST_MAX } from '@/lib/guest-requests';
import { setGuestRequest } from '@/lib/guest-requests-server';
import { adminBookings } from '@/lib/booking-admin';

const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

describe('cleanRequest', () => {
  it('keeps plain text, tidies whitespace and limits the length', () => {
    expect(cleanRequest('  Late   check-in\nplease  ')).toEqual({ ok: true, note: 'Late check-in please' });
    const r = cleanRequest('x'.repeat(1000));
    expect(r.ok && r.note.length).toBe(REQUEST_MAX);
  });
  it('an empty or missing text clears the request, other types are refused', () => {
    expect(cleanRequest('')).toEqual({ ok: true, note: '' });
    expect(cleanRequest(undefined)).toEqual({ ok: true, note: '' });
    expect(cleanRequest(null)).toEqual({ ok: true, note: '' });
    expect(cleanRequest(5).ok).toBe(false);
    expect(cleanRequest({}).ok).toBe(false);
  });
});

describe('canEditRequest', () => {
  it('only confirmed stays that are not over', () => {
    expect(canEditRequest({ status: 'confirmed', end: '2026-10-11' }, '2026-10-10')).toBe(true);
    expect(canEditRequest({ status: 'confirmed', end: '2026-10-10' }, '2026-10-10')).toBe(false);
    expect(canEditRequest({ status: 'cancelled', end: '2026-10-20' }, '2026-10-10')).toBe(false);
    expect(canEditRequest({ status: 'review', end: '2026-10-20' }, '2026-10-10')).toBe(false);
  });
});

describe('texts', () => {
  it('every language has every string', () => {
    const keys = Object.keys(REQUEST_I18N.en);
    for (const [lang, t] of Object.entries(REQUEST_I18N)) for (const k of keys) expect((t as unknown as Record<string, string>)[k], `${lang}.${k}`).toBeTruthy();
  });
});

describe('setGuestRequest / admin view', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    store.bookings = {
      ok: { uid: 'u1', username: 'sara', status: 'confirmed', start: day(3), end: day(6), nights: 3, amount: 90, propertyTitle: 'Nile Hotel', propertyId: 'h1' },
      over: { uid: 'u1', username: 'sara', status: 'confirmed', start: day(-5), end: day(-2), nights: 3, amount: 90, propertyTitle: 'Nile Hotel', propertyId: 'h1' },
      gone: { uid: 'u1', username: 'sara', status: 'cancelled', start: day(3), end: day(6), nights: 3, amount: 90, propertyTitle: 'Nile Hotel', propertyId: 'h1' },
    };
  });
  it('saves the request on the guest’s own stay and the admin sees it', async () => {
    expect(await setGuestRequest('u1', 'ok', 'Baby cot please')).toEqual({ ok: true, note: 'Baby cot please' });
    expect(store.bookings.ok.guestNote).toBe('Baby cot please');
    const a = await adminBookings();
    expect(a.bookings.find((b) => b.id === 'ok')?.note).toBe('Baby cot please');
    expect(a.bookings.find((b) => b.id === 'gone')?.note).toBe('');
  });
  it('clears the request with an empty text', async () => {
    await setGuestRequest('u1', 'ok', 'x');
    expect(await setGuestRequest('u1', 'ok', '  ')).toEqual({ ok: true, note: '' });
    expect(store.bookings.ok.guestNote).toBe('');
  });
  it('refuses another guest, a finished or cancelled stay, and bad input', async () => {
    expect(await setGuestRequest('u2', 'ok', 'hi')).toMatchObject({ ok: false, status: 404 });
    expect(await setGuestRequest('u1', 'over', 'hi')).toMatchObject({ ok: false, status: 409 });
    expect(await setGuestRequest('u1', 'gone', 'hi')).toMatchObject({ ok: false, status: 409 });
    expect(await setGuestRequest('u1', 'nope', 'hi')).toMatchObject({ ok: false, status: 404 });
    expect(await setGuestRequest('u1', 'a/b', 'hi')).toMatchObject({ ok: false, status: 400 });
    expect(await setGuestRequest('u1', 'ok', 42)).toMatchObject({ ok: false, status: 400 });
    expect(store.bookings.over.guestNote).toBeUndefined();
  });
});
