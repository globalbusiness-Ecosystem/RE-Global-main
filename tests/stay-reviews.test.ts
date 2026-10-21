import { describe, it, expect, vi, beforeEach } from 'vitest';

type Doc = Record<string, unknown>;
const store: Record<string, Record<string, Doc>> = {};
const fake = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => ({ exists: !!store[name]?.[id], id, data: () => store[name]?.[id] }),
      create: async (d: Doc) => {
        store[name] ??= {};
        if (store[name][id]) throw Object.assign(new Error('exists'), { code: 6 });
        store[name][id] = d;
      },
      update: async (d: Doc) => { store[name][id] = { ...store[name][id], ...d }; },
    }),
    where: (field: string, _op: string, value: unknown) => ({
      limit: () => ({
        get: async () => ({ docs: Object.entries(store[name] ?? {}).filter(([, d]) => d[field] === value).map(([id, d]) => ({ id, data: () => d })) }),
      }),
    }),
  }),
};
vi.mock('@/lib/firebase-admin', () => ({ adminDb: { collection: (n: string) => fake.collection(n) } }));

import { canReview, maskName, summarize, validateReview, REVIEW_I18N, reviewCount, starsText, REVIEW_COMMENT_MAX } from '@/lib/stay-reviews';
import { submitReview, publicReviews, adminSetReviewHidden } from '@/lib/stay-reviews-server';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

describe('validateReview', () => {
  it('accepts 1-5 and cleans the comment', () => {
    expect(validateReview({ rating: 5, comment: '  Great\nstay  ' })).toEqual({ ok: true, rating: 5, comment: 'Great stay' });
    expect(validateReview({ rating: '4' })).toEqual({ ok: true, rating: 4, comment: '' });
  });
  it('rejects bad ratings', () => {
    for (const rating of [0, 6, 2.5, 'x', null, undefined]) expect(validateReview({ rating }).ok).toBe(false);
    expect(validateReview(null).ok).toBe(false);
  });
  it('limits the comment length', () => {
    const r = validateReview({ rating: 3, comment: 'x'.repeat(2000) });
    expect(r.ok && r.comment.length).toBe(REVIEW_COMMENT_MAX);
  });
});

describe('canReview / maskName / summarize', () => {
  it('only confirmed stays that have ended', () => {
    expect(canReview({ status: 'confirmed', end: '2026-10-10' }, '2026-10-10')).toBe(true);
    expect(canReview({ status: 'confirmed', end: '2026-10-11' }, '2026-10-10')).toBe(false);
    expect(canReview({ status: 'cancelled', end: '2026-10-01' }, '2026-10-10')).toBe(false);
    expect(canReview({ status: 'review', end: '2026-10-01' }, '2026-10-10')).toBe(false);
  });
  it('masks the guest name', () => {
    expect(maskName('@Ahmed777')).toBe('Ah***');
    expect(maskName('')).toBe('***');
    expect(maskName(undefined)).toBe('***');
  });
  it('averages to one decimal and ignores bad ratings', () => {
    expect(summarize([])).toEqual({ count: 0, avg: 0 });
    expect(summarize([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toEqual({ count: 3, avg: 4.3 });
    expect(summarize([{ rating: 5 }, { rating: 99 }])).toEqual({ count: 1, avg: 5 });
  });
});

describe('texts', () => {
  it('every language has every string', () => {
    const keys = Object.keys(REVIEW_I18N.en);
    for (const [lang, t] of Object.entries(REVIEW_I18N)) {
      for (const k of keys) expect((t as unknown as Record<string, string>)[k], `${lang}.${k}`).toBeTruthy();
    }
    expect(reviewCount('en', 3)).toBe('3 reviews');
    expect(starsText(4)).toBe('★★★★☆');
  });
  it('audit log has labels', () => {
    expect(auditLabel('review.hide')).not.toBe('review.hide');
    expect(auditLabel('review.show')).not.toBe('review.show');
    expect(auditSummary('review.hide', { title: 'Nile Hotel' })).toBe('Nile Hotel');
  });
});

describe('submitReview', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    store.bookings = {
      done: { uid: 'u1', status: 'confirmed', end: day(-1), propertyId: 'h1', propertyTitle: 'Nile Hotel' },
      future: { uid: 'u1', status: 'confirmed', end: day(5), propertyId: 'h1', propertyTitle: 'Nile Hotel' },
      cancelled: { uid: 'u1', status: 'cancelled', end: day(-3), propertyId: 'h1', propertyTitle: 'Nile Hotel' },
    };
  });
  it('stores a review for a finished stay of the same guest', async () => {
    const r = await submitReview('u1', '@sara', 'done', { rating: 5, comment: 'Lovely' });
    expect(r.ok).toBe(true);
    expect(store.stay_reviews.done).toMatchObject({ propertyId: 'h1', uid: 'u1', name: 'sa***', rating: 5, hidden: false });
  });
  it('refuses someone else, an unfinished or a cancelled stay', async () => {
    expect(await submitReview('u2', 'x', 'done', { rating: 5 })).toMatchObject({ ok: false, status: 404 });
    expect(await submitReview('u1', 'x', 'future', { rating: 5 })).toMatchObject({ ok: false, status: 409 });
    expect(await submitReview('u1', 'x', 'cancelled', { rating: 5 })).toMatchObject({ ok: false, status: 409 });
    expect(await submitReview('u1', 'x', 'nope', { rating: 5 })).toMatchObject({ ok: false, status: 404 });
    expect(await submitReview('u1', 'x', 'a/b', { rating: 5 })).toMatchObject({ ok: false, status: 400 });
    expect(await submitReview('u1', 'x', 'done', { rating: 9 })).toMatchObject({ ok: false, status: 400 });
  });
  it('allows one review per booking', async () => {
    expect((await submitReview('u1', 'x', 'done', { rating: 4 })).ok).toBe(true);
    expect(await submitReview('u1', 'x', 'done', { rating: 1 })).toMatchObject({ ok: false, status: 409 });
    expect(store.stay_reviews.done.rating).toBe(4);
  });
});

describe('publicReviews / hiding', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    const t = (d: string) => ({ toDate: () => new Date(`${d}T10:00:00Z`) });
    store.stay_reviews = {
      a: { propertyId: 'h1', propertyTitle: 'Nile', uid: 'u1', name: 'sa***', rating: 5, comment: 'Great', hidden: false, createdAt: t('2026-10-02') },
      b: { propertyId: 'h1', propertyTitle: 'Nile', uid: 'u2', name: 'om***', rating: 3, comment: 'Ok', hidden: false, createdAt: t('2026-10-05') },
      c: { propertyId: 'h1', propertyTitle: 'Nile', uid: 'u3', name: 'ab***', rating: 1, comment: 'Spam', hidden: true, createdAt: t('2026-10-06') },
      d: { propertyId: 'other', propertyTitle: 'X', uid: 'u4', name: 'zz***', rating: 5, comment: '', hidden: false, createdAt: t('2026-10-01') },
    };
  });
  it('lists visible reviews of one listing, newest first, with no user ids', async () => {
    const r = await publicReviews('h1');
    expect(r.summary).toEqual({ count: 2, avg: 4 });
    expect(r.reviews.map((x) => x.comment)).toEqual(['Ok', 'Great']);
    expect(JSON.stringify(r)).not.toMatch(/u1|u2|uid/);
  });
  it('hides and shows a review', async () => {
    expect((await adminSetReviewHidden('a', true)).ok).toBe(true);
    expect((await publicReviews('h1')).summary.count).toBe(1);
    expect((await adminSetReviewHidden('a', false)).ok).toBe(true);
    expect((await publicReviews('h1')).summary.count).toBe(2);
    expect(await adminSetReviewHidden('zzz', true)).toMatchObject({ ok: false, status: 404 });
  });
});
