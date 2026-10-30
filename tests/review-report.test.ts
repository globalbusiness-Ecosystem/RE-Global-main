import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
type Doc = Record<string, unknown>;
const h = vi.hoisted(() => ({ store: {} as Record<string, Doc>, updates: [] as { id: string; d: Doc }[] }));
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => ({
      where: (field: string, _op: string, value: unknown) => ({
        limit: () => ({
          get: async () => ({
            docs: Object.entries(h.store).filter(([, d]) => d[field] === value)
              .map(([id, d]) => ({ id, data: () => d, ref: { update: async (u: Doc) => { h.updates.push({ id, d: u }); } } })),
          }),
        }),
      }),
    }),
  },
}));
const limited = vi.fn();
vi.mock('@/lib/rate-guard', () => ({ ipLimited: (...a: unknown[]) => limited(...a), rateLimited: async () => null }));
const alert = vi.fn();
vi.mock('@/lib/admin-alert', () => ({ alertAdmin: (...a: unknown[]) => alert(...a) }));

import { publicReviews, reportReview, reviewRid } from '@/lib/stay-reviews-server';
import { reviewReportStrings, REVIEW_REPORT_I18N } from '@/lib/review-report';
import { POST } from '@/app/api/reviews/report/route';

const post = (body: unknown) => ({ headers: new Headers(), json: async () => body }) as never;

beforeEach(() => {
  h.updates.length = 0;
  limited.mockReset(); limited.mockResolvedValue(null);
  alert.mockReset();
  h.store = {
    'pay-1': { propertyId: 'p1', propertyTitle: 'Nile Hotel', rating: 5, comment: 'Great', name: 'an***', hidden: false },
    'pay-2': { propertyId: 'p1', propertyTitle: 'Nile Hotel', rating: 2, comment: 'Bad', name: 'bo***', hidden: false, reports: 2 },
    'pay-3': { propertyId: 'p1', propertyTitle: 'Nile Hotel', rating: 1, comment: 'x', name: 'cy***', hidden: true },
  };
});

describe('review handle', () => {
  it('is a short one-way hash, never the payment id', async () => {
    expect(reviewRid('pay-1')).toMatch(/^[0-9a-f]{16}$/);
    expect(reviewRid('pay-1')).not.toBe(reviewRid('pay-2'));
    const out = await publicReviews('p1');
    expect(JSON.stringify(out)).not.toContain('pay-');
    expect(out.reviews.every((r) => /^[0-9a-f]{16}$/.test(r.rid))).toBe(true);
  });
});

describe('reportReview', () => {
  it('raises the counter and says when it is the first report', async () => {
    const a = await reportReview('p1', reviewRid('pay-1'));
    expect(a).toMatchObject({ ok: true, first: true, title: 'Nile Hotel' });
    expect(h.updates[0].id).toBe('pay-1');
    expect(h.updates[0].d).toHaveProperty('reports');
    const b = await reportReview('p1', reviewRid('pay-2'));
    expect(b).toMatchObject({ ok: true, first: false });
  });
  it('refuses bad handles, unknown reviews and hidden reviews', async () => {
    expect((await reportReview('p1', 'nope')).ok).toBe(false);
    expect((await reportReview('p/1', reviewRid('pay-1'))).ok).toBe(false);
    expect(await reportReview('p1', '0123456789abcdef')).toMatchObject({ ok: false, status: 404 });
    expect(await reportReview('p1', reviewRid('pay-3'))).toMatchObject({ ok: false, status: 404 });
    expect(h.updates).toHaveLength(0);
  });
});

describe('POST /api/reviews/report', () => {
  it('flags a review and alerts the admin only on the first report', async () => {
    expect((await POST(post({ propertyId: 'p1', rid: reviewRid('pay-1') }))).status).toBe(200);
    expect(alert).toHaveBeenCalledTimes(1);
    expect((await POST(post({ propertyId: 'p1', rid: reviewRid('pay-2') }))).status).toBe(200);
    expect(alert).toHaveBeenCalledTimes(1);
  });
  it('rejects junk and respects the rate limit', async () => {
    expect((await POST(post({ propertyId: 'p1', rid: 'x' }))).status).toBe(400);
    expect((await POST(post(null))).status).toBe(400);
    limited.mockResolvedValue(new Response('{}', { status: 429 }));
    expect((await POST(post({ propertyId: 'p1', rid: reviewRid('pay-1') }))).status).toBe(429);
    expect(h.updates).toHaveLength(0);
  });
});

describe('strings', () => {
  it('cover every language and fall back to English', () => {
    for (const l of Object.keys(REVIEW_REPORT_I18N)) expect(reviewReportStrings(l).report).toBeTruthy();
    expect(reviewReportStrings('xx').report).toBe('Report');
  });
});

describe('public summary response rate', () => {
  it('is null for few reviews', async () => {
    const out = await publicReviews('p1');
    expect(out.summary.responseRate).toBeNull();
  });
  it('is the share of visible reviews with a reply once there are enough', async () => {
    h.store = Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`x${i}`, { propertyId: 'p2', propertyTitle: 'T', rating: 5, comment: '', name: 'a***', hidden: false, reply: i < 2 ? 'ok' : '' }]));
    const out = await publicReviews('p2');
    expect(out.summary.responseRate).toBe(40);
  });
});
