import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('server-only', () => ({}));
const send = vi.fn();
vi.mock('@/lib/send-email', () => ({ sendEmail: (...a: unknown[]) => send(...a), emailConfigured: () => true }));
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: async () => ({ ok: true, retryAfter: 0 }), clientIp: () => '1.2.3.4' }));

import { alertReview } from '@/lib/admin-alert';

beforeEach(() => { send.mockReset(); send.mockResolvedValue(undefined); process.env.ADMIN_ALERT_EMAIL = 'owner@example.com'; });
afterEach(() => { delete process.env.ADMIN_ALERT_EMAIL; });

describe('manual review alert', () => {
  it('emails the owner with the payment details, escaped', async () => {
    expect(await alertReview('حجز', { 'رقم الدفع': 'pay_1', 'المستخدم': '<b>x</b>' })).toBe(true);
    const arg = send.mock.calls[0][0];
    expect(arg.subject).toContain('مراجعة يدوية');
    expect(arg.html).toContain('pay_1');
    expect(arg.html).not.toContain('<b>x</b>');
  });
  it('stays silent when no alert address is set', async () => {
    delete process.env.ADMIN_ALERT_EMAIL;
    expect(await alertReview('حجز', {})).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });
});
