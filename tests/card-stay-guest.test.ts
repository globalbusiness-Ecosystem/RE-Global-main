import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { refundText } from '@/lib/cancellation';
import { buildReceiptHtml } from '@/lib/receipt';
import { pickBooking } from '@/lib/offline-bookings';
import { formatMoney } from '@/lib/format';

const src = (p: string) => readFileSync(p, 'utf8');
const D = { bookingId: 'b1', paymentId: 'pay1', title: 'Nile Hotel', start: '2026-11-01', end: '2026-11-04', nights: 3, amount: 4500, username: 'sara', issuedAt: '2026-10-22T10:00:00.000Z' };

describe('a stay paid by card shows its own currency to the guest', () => {
  it('the refund message uses the card currency instead of the Pi sign, in every language', () => {
    const langs = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];
    for (const l of langs) {
      const full = refundText(l, { pct: 100, refund: 4500 }, '4,500', 'EGP 4,500');
      const part = refundText(l, { pct: 50, refund: 2250 }, '2,250', 'EGP 2,250');
      expect(full, l).toContain('EGP 4,500');
      expect(full, l).not.toContain('π');
      expect(part, l).toContain('EGP 2,250');
      expect(part, l).not.toContain('π');
    }
  });
  it('Pi stays are unchanged', () => {
    expect(refundText('en', { pct: 50, refund: 40 }, '40.00')).toContain('40.00 π back (50%)');
  });
  it('the receipt shows the card currency, and Pi when there is none', () => {
    expect(buildReceiptHtml('en', { ...D, currency: 'EGP' })).toContain('4500.00 EGP');
    expect(buildReceiptHtml('en', D)).toContain('4500.00 π');
    expect(buildReceiptHtml('en', { ...D, currency: '<b>' })).not.toContain('<b>');
  });
  it('the saved offline copy keeps a clean currency code only', () => {
    expect(pickBooking({ id: 'x', amount: 5, currency: 'EGP' })).toMatchObject({ currency: 'EGP' });
    expect(pickBooking({ id: 'x', amount: 5, currency: '<script>' })?.currency).toBeUndefined();
    expect(pickBooking({ id: 'x', amount: 5 })?.currency).toBeUndefined();
  });
  it('the money formatter puts Pi and other currencies right', () => {
    expect(formatMoney(10, 'Pi', 'en')).toContain('π');
    expect(formatMoney(10, 'EGP', 'en')).toContain('EGP');
  });
  it('the list, quote and receipt are wired to the booking currency', () => {
    expect(src('components/my-bookings-list.tsx')).toContain("formatMoney(b.amount, b.currency ?? 'Pi'");
    expect(src('lib/booking-cancel.ts')).toContain("currency: String(d.currency ?? 'Pi')");
    expect(src('lib/receipt-server.ts')).toContain('currency: d.currency');
    expect(src('components/cancel-booking.tsx')).toContain('quote.currency');
  });
});
