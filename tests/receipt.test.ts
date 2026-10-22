import { describe, it, expect, vi, beforeEach } from 'vitest';

type Doc = Record<string, unknown>;
const store: Record<string, Record<string, Doc>> = {};
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: { collection: (name: string) => ({ doc: (id: string) => ({ get: async () => ({ exists: !!store[name]?.[id], data: () => store[name]?.[id] }) }) }) },
}));

import { buildReceiptHtml, esc, RECEIPT_I18N, type ReceiptData } from '@/lib/receipt';
import { guestReceiptData } from '@/lib/receipt-server';

const D: ReceiptData = { bookingId: 'b1', paymentId: 'pay1', title: 'Nile Hotel', start: '2026-11-01', end: '2026-11-04', nights: 3, guests: 2, amount: 90, checkInTime: '14:00', checkOutTime: '11:00', username: 'sara', issuedAt: '2026-10-22T10:00:00.000Z', policy: 'Free cancellation up to 7 days before check-in.' };

describe('esc', () => {
  it('escapes HTML special characters', () => {
    expect(esc(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
    expect(esc(undefined)).toBe('');
  });
});

describe('buildReceiptHtml', () => {
  it('has the booking, the dates, the total and the policy', () => {
    const h = buildReceiptHtml('en', D);
    for (const s of ['Booking receipt', 'b1', 'pay1', 'Nile Hotel', '2026-11-01', '2026-11-04', '14:00', '11:00', '@sara', '90.00 π', 'Free cancellation up to 7 days', 'Issued: 2026-10-22']) expect(h).toContain(s);
    expect(h).toContain('dir="ltr"');
  });
  it('is right-to-left in Arabic and Urdu and falls back to English', () => {
    expect(buildReceiptHtml('ar', D)).toContain('dir="rtl"');
    expect(buildReceiptHtml('ur', D)).toContain('dir="rtl"');
    const x = buildReceiptHtml('xx', D);
    expect(x).toContain('lang="en"');
    expect(x).toContain('Booking receipt');
  });
  it('never lets a listing title or a name inject markup', () => {
    const h = buildReceiptHtml('en', { ...D, title: '<script>alert(1)</script>', username: '"><img src=x>' });
    expect(h).not.toContain('<script>');
    expect(h).not.toContain('<img');
    expect(h).toContain('&lt;script&gt;');
    expect(h).not.toMatch(/<script/i);
  });
  it('leaves out the optional rows when they are missing', () => {
    const { guests: _g, checkInTime: _a, checkOutTime: _b, policy: _p, ...rest } = D;
    void _g; void _a; void _b; void _p;
    const h = buildReceiptHtml('en', rest);
    expect(h).not.toContain('Check-in time');
    expect(h).not.toContain('Guests');
    expect(h).not.toContain('Cancellation policy');
  });
  it('every language has every string', () => {
    const keys = Object.keys(RECEIPT_I18N.en);
    for (const [lang, t] of Object.entries(RECEIPT_I18N)) for (const k of keys) expect((t as unknown as Record<string, string>)[k], `${lang}.${k}`).toBeTruthy();
  });
});

describe('guestReceiptData', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    store.bookings = {
      ok: { uid: 'u1', username: 'sara', status: 'confirmed', start: '2026-11-01', end: '2026-11-04', nights: 3, amount: 90, guests: 2, propertyId: 'h1', propertyTitle: 'Nile Hotel', paymentId: 'pay1' },
      gone: { uid: 'u1', username: 'sara', status: 'cancelled', start: '2026-11-01', end: '2026-11-04', nights: 3, amount: 90, propertyId: 'h1', propertyTitle: 'Nile Hotel' },
    };
    store.properties = { h1: { checkInTime: '15:00', checkOutTime: '99:99' } };
  });
  it('returns the data for the owner, with valid listing times only', async () => {
    const r = await guestReceiptData('u1', 'ok', 'en');
    expect(r.ok && r.data).toMatchObject({ bookingId: 'ok', paymentId: 'pay1', title: 'Nile Hotel', nights: 3, guests: 2, amount: 90, checkInTime: '15:00', username: 'sara' });
    expect(r.ok && 'checkOutTime' in r.data).toBe(false);
    expect(r.ok && r.data.policy).toContain('Free cancellation');
  });
  it('refuses other guests, cancelled and unknown bookings', async () => {
    expect(await guestReceiptData('u2', 'ok', 'en')).toMatchObject({ ok: false, status: 404 });
    expect(await guestReceiptData('u1', 'gone', 'en')).toMatchObject({ ok: false, status: 409 });
    expect(await guestReceiptData('u1', 'nope', 'en')).toMatchObject({ ok: false, status: 404 });
    expect(await guestReceiptData('u1', 'a/b', 'en')).toMatchObject({ ok: false, status: 400 });
  });
});
