import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
const consume = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a), clientIp: () => '1.2.3.4' }));
const getListing = vi.fn();
vi.mock('@/lib/public-listings-server', () => ({ getPublicListing: (...a: unknown[]) => getListing(...a) }));
const create = vi.fn();
const listOpen = vi.fn();
const resolve = vi.fn();
vi.mock('@/lib/listing-report-store', () => ({
  createListingReport: (...a: unknown[]) => create(...a), listOpenReports: (...a: unknown[]) => listOpen(...a), resolveListingReport: (...a: unknown[]) => resolve(...a),
}));
const alert = vi.fn();
vi.mock('@/lib/admin-alert', () => ({ alertAdmin: (...a: unknown[]) => alert(...a) }));
const isAdmin = vi.fn();
vi.mock('@/lib/admin-guard', () => ({ isAdminRequest: (...a: unknown[]) => isAdmin(...a) }));
const logAdmin = vi.fn();
vi.mock('@/lib/admin-audit', () => ({ logAdmin: (...a: unknown[]) => logAdmin(...a) }));

import { normalizeReport, REPORT_REASONS } from '@/lib/listing-report';
import { REPORT_I18N } from '@/lib/report-i18n';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';
import { POST } from '@/app/api/listing-report/route';
import { GET, PATCH } from '@/app/api/admin/listing-reports/route';

const post = (body: unknown, raw?: string) => ({ headers: new Headers(), text: async () => raw ?? JSON.stringify(body) }) as never;
const patch = (body: unknown) => ({ cookies: { get: () => undefined }, json: async () => body }) as never;
const ok = { listingId: 'abc-1', reason: 'scam', details: 'looks fake', email: 'a@b.co' };

describe('normalizeReport', () => {
  it('keeps a small clean record', () => {
    expect(normalizeReport({ ...ok, details: '  line1\n\n line2\u0000  ' })).toEqual({ listingId: 'abc-1', reason: 'scam', details: 'line1 line2', email: 'a@b.co' });
    expect(normalizeReport({ ...ok, details: 'x'.repeat(5000) })!.details.length).toBe(1000);
    expect(normalizeReport({ listingId: 'abc', reason: 'other' })!.details).toBe('');
  });
  it('drops a bad e-mail but still takes the report', () => {
    expect(normalizeReport({ ...ok, email: 'not an email' })!.email).toBe('');
  });
  it('refuses junk', () => {
    for (const bad of [null, 'x', 5, [], {}, { ...ok, reason: 'weird' }, { ...ok, listingId: '../x' }, { ...ok, listingId: '' }, { ...ok, listingId: 'a/b' }]) expect(normalizeReport(bad)).toBeNull();
  });
});

describe('texts', () => {
  it('every language has every text and every reason', () => {
    for (const lang of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const) {
      const t = REPORT_I18N[lang];
      for (const [k, v] of Object.entries(t)) if (k !== 'reasons') expect((v as string).trim().length).toBeGreaterThan(1);
      for (const r of REPORT_REASONS) expect(t.reasons[r].trim().length).toBeGreaterThan(1);
    }
  });
});

describe('POST /api/listing-report', () => {
  beforeEach(() => {
    consume.mockReset(); getListing.mockReset(); create.mockReset(); alert.mockReset();
    consume.mockResolvedValue({ ok: true, retryAfter: 0 }); getListing.mockResolvedValue({ id: 'abc-1' }); create.mockResolvedValue('r1'); alert.mockResolvedValue(true);
  });
  it('stores the report and tells the owner', async () => {
    const res = await POST(post(ok));
    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalledTimes(1);
    expect(alert.mock.calls[0][0]).toBe('listing-report');
  });
  it('refuses bad, big, or unknown-listing reports without storing', async () => {
    expect((await POST(post({ ...ok, reason: 'x' }))).status).toBe(400);
    expect((await POST(post(null, 'not json'))).status).toBe(400);
    expect((await POST(post(null, 'x'.repeat(5000)))).status).toBe(400);
    getListing.mockResolvedValue(null);
    expect((await POST(post(ok))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
  it('answers 429 when over the limit', async () => {
    consume.mockResolvedValue({ ok: false, retryAfter: 9 });
    const res = await POST(post(ok));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('9');
    expect(create).not.toHaveBeenCalled();
  });
  it('answers 500 when the store is down', async () => {
    create.mockRejectedValue(new Error('db down'));
    expect((await POST(post(ok))).status).toBe(500);
  });
});

describe('admin reports', () => {
  beforeEach(() => { isAdmin.mockReset(); resolve.mockReset(); logAdmin.mockReset(); listOpen.mockReset(); });
  it('is for the admin only', async () => {
    isAdmin.mockResolvedValue(false);
    expect((await GET(patch(null))).status).toBe(401);
    expect((await PATCH(patch({ id: 'r1', status: 'resolved' }))).status).toBe(401);
    expect(resolve).not.toHaveBeenCalled();
  });
  it('lists open reports', async () => {
    isAdmin.mockResolvedValue(true); listOpen.mockResolvedValue([{ id: 'r1' }]);
    expect((await (await GET(patch(null))).json()).rows).toEqual([{ id: 'r1' }]);
  });
  it('closes a report and writes it to the activity log', async () => {
    isAdmin.mockResolvedValue(true); resolve.mockResolvedValue(200);
    expect((await PATCH(patch({ id: 'r1', status: 'dismissed', note: 'ok' }))).status).toBe(200);
    expect(resolve).toHaveBeenCalledWith('r1', 'dismissed', 'ok');
    expect(logAdmin.mock.calls[0][0]).toBe('listing.report.resolve');
  });
  it('rejects bad input and reports 404/409', async () => {
    isAdmin.mockResolvedValue(true);
    expect((await PATCH(patch({ id: 'a/b', status: 'resolved' }))).status).toBe(400);
    expect((await PATCH(patch({ id: 'r1', status: 'open' }))).status).toBe(400);
    resolve.mockResolvedValue(404);
    expect((await PATCH(patch({ id: 'r1', status: 'resolved' }))).status).toBe(404);
    resolve.mockResolvedValue(409);
    expect((await PATCH(patch({ id: 'r1', status: 'resolved' }))).status).toBe(409);
    expect(logAdmin).not.toHaveBeenCalled();
  });
});

describe('reports on the attention list', () => {
  const base: AttentionInput = {
    env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true },
    usdProperties: 0, piRateSet: false,
    pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 },
  };
  it('shows only when there are open reports', () => {
    expect(buildAttention({ ...base, openReports: 2 }).map((x) => x.id)).toEqual(['reports']);
    expect(buildAttention({ ...base, openReports: 0 })).toEqual([]);
    expect(buildAttention(base)).toEqual([]);
  });
});
