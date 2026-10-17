import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('server-only', () => ({}));
const send = vi.fn();
let configured = true;
vi.mock('@/lib/send-email', () => ({ sendEmail: (...a: unknown[]) => send(...a), emailConfigured: () => configured }));
const consume = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a), clientIp: () => '1.2.3.4' }));

import { alertAdmin, buildAlertHtml, escapeHtml, adminAlertContext } from '@/lib/admin-alert';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';

beforeEach(() => {
  send.mockReset(); consume.mockReset(); configured = true;
  consume.mockResolvedValue({ ok: true, retryAfter: 0 });
  send.mockResolvedValue(undefined);
  process.env.ADMIN_ALERT_EMAIL = 'owner@example.com';
});
afterEach(() => { delete process.env.ADMIN_ALERT_EMAIL; });

describe('admin alert email', () => {
  it('escapes anything that came from the request', () => {
    expect(escapeHtml('<script>"x"&\'y\'</script>')).toBe('&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;');
    const html = buildAlertHtml('t<b>', { 'المتصفح': '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<img');
    expect(html).toContain('t&lt;b&gt;');
    expect(html).toContain('&lt;img');
  });

  it('sends to the configured address with the details', async () => {
    expect(await alertAdmin('login', 'تسجيل دخول', { IP: '1.2.3.4' })).toBe(true);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe('owner@example.com');
    expect(arg.subject).toContain('تسجيل دخول');
    expect(arg.html).toContain('1.2.3.4');
  });

  it('does nothing when no alert address, a bad address or no mail service is set', async () => {
    delete process.env.ADMIN_ALERT_EMAIL;
    expect(await alertAdmin('login', 't', {})).toBe(false);
    process.env.ADMIN_ALERT_EMAIL = 'not an email';
    expect(await alertAdmin('login', 't', {})).toBe(false);
    process.env.ADMIN_ALERT_EMAIL = 'owner@example.com';
    configured = false;
    expect(await alertAdmin('login', 't', {})).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it('is throttled per kind, so an attack cannot flood the inbox', async () => {
    consume.mockResolvedValue({ ok: false, retryAfter: 100 });
    expect(await alertAdmin('lockout', 't', {})).toBe(false);
    expect(send).not.toHaveBeenCalled();
    expect(consume.mock.calls[0][0]).toBe('admin-alert:lockout');
  });

  it('never throws when the mail server fails', async () => {
    send.mockRejectedValue(new Error('smtp down'));
    expect(await alertAdmin('login', 't', {})).toBe(false);
  });

  it('describes the request without trusting its length', () => {
    const ctx = adminAlertContext(new Request('http://x', { headers: { 'user-agent': 'a'.repeat(500) } }));
    expect(ctx.IP).toBe('1.2.3.4');
    expect(ctx['المتصفح'].length).toBe(120);
  });
});

describe('missing alert address reminder', () => {
  const ok: AttentionInput = {
    env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true },
    usdProperties: 0, piRateSet: false,
    pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 },
  };
  it('warns only when mail is set up but no alert address is', () => {
    expect(buildAttention({ ...ok, env: { ...ok.env, ADMIN_ALERT_EMAIL: false } }).map((x) => x.id)).toEqual(['env-alert']);
    expect(buildAttention({ ...ok, env: { ...ok.env, ADMIN_ALERT_EMAIL: true } })).toEqual([]);
    expect(buildAttention(ok)).toEqual([]);
  });
});
