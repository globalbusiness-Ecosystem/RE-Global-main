import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
const h = vi.hoisted(() => ({ admin: true, configured: true, sent: [] as Array<{ to: string; subject: string }>, fail: false, limited: false }));
vi.mock('@/lib/admin-guard', () => ({ isAdminRequest: async () => h.admin }));
vi.mock('@/lib/admin-audit', () => ({ logAdmin: async () => undefined }));
vi.mock('@/lib/send-email', () => ({
  emailConfigured: () => h.configured,
  sendEmail: async (o: { to: string; subject: string }) => { if (h.fail) throw new Error('boom secret-detail'); h.sent.push(o); },
}));
vi.mock('@/lib/rate-guard', () => ({
  ipLimited: async () => (h.limited ? new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 }) : null),
}));

import { GET, POST } from '@/app/api/admin/notify-test/route';
import { notifyReadiness } from '@/lib/notify-readiness';

const req = () => ({ headers: new Headers() }) as never;

beforeEach(() => {
  h.admin = true; h.configured = true; h.sent = []; h.fail = false; h.limited = false;
  process.env.ADMIN_ALERT_EMAIL = 'boss@example.com';
  process.env.CRON_SECRET = 'x'.repeat(20);
});

describe('notifyReadiness', () => {
  it('is ready when mail and the cron secret are set, even without the admin address', () => {
    expect(notifyReadiness({ mailConfigured: true, cronSecretOk: true, adminEmailValid: false }).ready).toBe(true);
  });
  it('is not ready without mail or without the cron secret, and says how to fix each', () => {
    const a = notifyReadiness({ mailConfigured: false, cronSecretOk: true, adminEmailValid: true });
    expect(a.ready).toBe(false);
    expect(a.items.find((i) => i.id === 'mail')?.ok).toBe(false);
    expect(a.items.find((i) => i.id === 'mail')?.fix).toContain('Redeploy');
    expect(notifyReadiness({ mailConfigured: true, cronSecretOk: false, adminEmailValid: true }).ready).toBe(false);
  });
});

describe('GET /api/admin/notify-test', () => {
  it('rejects non-admins', async () => {
    h.admin = false;
    expect((await GET(req())).status).toBe(401);
  });
  it('returns yes/no only, never a value', async () => {
    const body = await (await GET(req())).json();
    expect(body.ready).toBe(true);
    expect(JSON.stringify(body)).not.toContain('boss@example.com');
    expect(JSON.stringify(body)).not.toContain('xxxxxxxx');
  });
  it('a short cron secret counts as missing', async () => {
    process.env.CRON_SECRET = 'short';
    expect((await (await GET(req())).json()).ready).toBe(false);
  });
});

describe('POST /api/admin/notify-test', () => {
  it('rejects non-admins and sends nothing', async () => {
    h.admin = false;
    expect((await POST(req())).status).toBe(401);
    expect(h.sent).toHaveLength(0);
  });
  it('sends one test mail, only to the admin address', async () => {
    expect((await POST(req())).status).toBe(200);
    expect(h.sent).toHaveLength(1);
    expect(h.sent[0].to).toBe('boss@example.com');
  });
  it('explains what is missing', async () => {
    h.configured = false;
    const r = await POST(req());
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe('mail-not-configured');
    h.configured = true; process.env.ADMIN_ALERT_EMAIL = 'not-an-email';
    expect((await (await POST(req())).json()).error).toBe('admin-email-missing');
    expect(h.sent).toHaveLength(0);
  });
  it('a failed send gives a generic code and leaks no detail', async () => {
    h.fail = true;
    const r = await POST(req());
    expect(r.status).toBe(502);
    expect(JSON.stringify(await r.json())).not.toContain('secret-detail');
  });
  it('is rate limited', async () => {
    h.limited = true;
    expect((await POST(req())).status).toBe(429);
    expect(h.sent).toHaveLength(0);
  });
});
