import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('server-only', () => ({}));
const send = vi.fn();
let configured = true;
vi.mock('@/lib/send-email', () => ({ sendEmail: (...a: unknown[]) => send(...a), emailConfigured: () => configured }));
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: async () => ({ ok: true, retryAfter: 0 }), clientIp: () => '1.2.3.4' }));
const reminders = vi.fn();
vi.mock('@/lib/guest-reminders-server', () => ({ sendGuestReminders: (...a: unknown[]) => reminders(...a) }));
const gather = vi.fn();
vi.mock('@/lib/admin-attention', () => ({ gatherAttention: (...a: unknown[]) => gather(...a) }));
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: { collection: () => ({ where: () => ({ count: () => ({ get: async () => ({ data: () => ({ count: 2 }) }) }) }) }) },
}));

import { buildDigest, digestRecipient } from '@/lib/daily-digest';
import { isCronRequest } from '@/lib/cron-auth';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';
import { GET } from '@/app/api/cron/daily-digest/route';

const req = (auth?: string) => ({ headers: new Headers(auth ? { authorization: auth } : {}) }) as never;
const SECRET = 'a-long-random-secret-123';

beforeEach(() => {
  send.mockReset(); send.mockResolvedValue(undefined); gather.mockReset(); configured = true;
  reminders.mockReset(); reminders.mockResolvedValue({ sent: 0, skipped: 0, failed: 0 });
  process.env.CRON_SECRET = SECRET; process.env.ADMIN_ALERT_EMAIL = 'owner@example.com';
});
afterEach(() => { delete process.env.CRON_SECRET; delete process.env.ADMIN_ALERT_EMAIL; });

describe('buildDigest', () => {
  it('says nothing when nothing needs attention', () => {
    expect(buildDigest([], 0, 'https://x/admin')).toBeNull();
  });
  it('lists the items, urgent first in the subject, and escapes the text', () => {
    const items = [
      { id: 'a', level: 'bad' as const, text: '2 حجز <b>محتاج</b> مراجعة', tab: 'payments' as const },
      { id: 'b', level: 'warn' as const, text: 'حاجة تانية', tab: 'dashboard' as const },
    ];
    const m = buildDigest(items, 3, 'https://x/admin')!;
    expect(m.subject).toContain('1 مستعجل');
    expect(m.html).toContain('&lt;b&gt;');
    expect(m.html).not.toContain('<b>');
    expect(m.html).toContain('3 نوع خطأ');
    expect(m.html).toContain('https://x/admin');
  });
  it('can report only errors', () => {
    expect(buildDigest([], 1, 'https://x/admin')!.html).toContain('1 نوع خطأ');
  });
});

describe('digestRecipient and isCronRequest', () => {
  it('needs a valid address', () => {
    expect(digestRecipient()).toBe('owner@example.com');
    process.env.ADMIN_ALERT_EMAIL = 'nope';
    expect(digestRecipient()).toBeNull();
    delete process.env.ADMIN_ALERT_EMAIL;
    expect(digestRecipient()).toBeNull();
  });
  it('accepts only the exact secret, and is off without a long secret', () => {
    expect(isCronRequest(req(`Bearer ${SECRET}`))).toBe(true);
    expect(isCronRequest(req('Bearer wrong'))).toBe(false);
    expect(isCronRequest(req())).toBe(false);
    process.env.CRON_SECRET = 'short';
    expect(isCronRequest(req('Bearer short'))).toBe(false);
    delete process.env.CRON_SECRET;
    expect(isCronRequest(req('Bearer '))).toBe(false);
  });
});

describe('GET /api/cron/daily-digest', () => {
  it('refuses callers without the secret and sends nothing', async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req('Bearer nope'))).status).toBe(401);
    expect(gather).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
  it('sends the summary when something needs attention', async () => {
    gather.mockResolvedValue([{ id: 'x', level: 'bad', text: 'مشكلة', tab: 'payments' }]);
    const res = await GET(req(`Bearer ${SECRET}`));
    expect(await res.json()).toEqual({ ok: true, sent: true, items: 1 });
    expect(send.mock.calls[0][0].to).toBe('owner@example.com');
  });
  it('still mentions errors when the list is empty, and stays silent only when all is clear', async () => {
    gather.mockResolvedValue([]);
    expect((await (await GET(req(`Bearer ${SECRET}`))).json()).sent).toBe(true);
  });
  it('does nothing without a recipient or mail service', async () => {
    delete process.env.ADMIN_ALERT_EMAIL;
    expect((await (await GET(req(`Bearer ${SECRET}`))).json()).sent).toBe(false);
    process.env.ADMIN_ALERT_EMAIL = 'owner@example.com'; configured = false;
    expect((await (await GET(req(`Bearer ${SECRET}`))).json()).sent).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });
  it('answers 500 (and sends nothing) when the data cannot be read', async () => {
    gather.mockRejectedValue(new Error('db down'));
    expect((await GET(req(`Bearer ${SECRET}`))).status).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('daily summary reminder', () => {
  const ok: AttentionInput = {
    env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true },
    usdProperties: 0, piRateSet: false,
    pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 },
  };
  it('warns only when alerts are on but the cron secret is missing', () => {
    expect(buildAttention({ ...ok, env: { ...ok.env, CRON_SECRET: false } }).map((x) => x.id)).toEqual(['env-cron']);
    expect(buildAttention({ ...ok, env: { ...ok.env, CRON_SECRET: true } })).toEqual([]);
    expect(buildAttention(ok)).toEqual([]);
  });
});

describe('guest reminders in the daily job', () => {
  it('runs them when mail is configured, even without an owner address', async () => {
    delete process.env.ADMIN_ALERT_EMAIL;
    await GET(req(`Bearer ${SECRET}`));
    expect(reminders).toHaveBeenCalledTimes(1);
  });
  it('does not run them for callers without the secret, or without a mail service', async () => {
    await GET(req('Bearer nope'));
    configured = false;
    await GET(req(`Bearer ${SECRET}`));
    expect(reminders).not.toHaveBeenCalled();
  });
  it('never blocks the owner summary when reminders fail', async () => {
    reminders.mockRejectedValue(new Error('boom'));
    gather.mockResolvedValue([{ id: 'x', level: 'bad', text: 'مشكلة', tab: 'payments' }]);
    const res = await GET(req(`Bearer ${SECRET}`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, sent: true, items: 1 });
  });
});
