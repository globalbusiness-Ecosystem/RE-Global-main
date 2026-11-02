import { describe, it, expect } from 'vitest';
import { PAID_WINDOW_DAYS, payoutAlerts } from '@/lib/payout-alerts';

const NOW = Date.parse('2026-11-01T10:00:00Z');
const DAY = 86_400_000;
const iso = (offsetDays: number) => new Date(NOW - offsetDays * DAY).toISOString();

describe('payout alerts', () => {
  it('tells the user a refund was sent', () => {
    const [a] = payoutAlerts([{ id: 'p1', kind: 'refund', amount: 12, status: 'paid', paidAt: iso(1) }], NOW);
    expect(a.id).toBe('payout-paid-p1');
    expect(a.type).toBe('payout');
    expect(a.titleEn).toBe('Your refund was sent');
    expect(a.descriptionEn).toContain('12 π');
  });
  it('words sale proceeds differently from a refund', () => {
    const [a] = payoutAlerts([{ id: 'p2', kind: 'resale', amount: 5, status: 'paid', paidAt: iso(0) }], NOW);
    expect(a.titleAr).toBe('تم تحويل حصيلة البيع');
  });
  it('drops paid alerts older than the window but keeps pending ones', () => {
    const rows = [
      { id: 'old', kind: 'refund', amount: 1, status: 'paid', paidAt: iso(PAID_WINDOW_DAYS + 1) },
      { id: 'wait', kind: 'refund', amount: 2, status: 'pending', createdAt: iso(90) },
    ];
    expect(payoutAlerts(rows, NOW).map((a) => a.id)).toEqual(['payout-pending-wait']);
  });
  it('ignores unknown statuses and broken rows, and sorts newest first', () => {
    const rows = [
      { id: 'a', kind: 'refund', amount: 1, status: 'weird' },
      { id: '', kind: 'refund', amount: 1, status: 'paid' },
      { id: 'b', kind: 'refund', amount: 1, status: 'paid', paidAt: iso(5) },
      { id: 'c', kind: 'refund', amount: 1, status: 'paid', paidAt: iso(2) },
    ] as never;
    expect(payoutAlerts(rows, NOW).map((a) => a.id)).toEqual(['payout-paid-c', 'payout-paid-b']);
  });
  it('treats a missing or bad amount as zero and a bad date as now', () => {
    const [a] = payoutAlerts([{ id: 'z', kind: 'refund', amount: NaN, status: 'paid', paidAt: 'nope' }], NOW);
    expect(a.descriptionEn).toContain('0 π');
    expect(a.createdAt.getTime()).toBe(NOW);
  });
});
