import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

type Store = Record<string, Record<string, Record<string, unknown>>>;
let store: Store = {};
const ref = (name: string, id: string) => ({ name, id });
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        ...ref(name, id),
        get: async () => ({ exists: !!store[name]?.[id], data: () => store[name]?.[id] }),
        set: async (d: Record<string, unknown>) => { (store[name] ||= {})[id] = d; },
      }),
      where: (field: string, _op: string, value: unknown) => ({
        limit: () => ({
          get: async () => ({
            docs: Object.entries(store[name] || {}).filter(([, d]) => d[field] === value)
              .map(([id, d]) => ({ id, data: () => d, ref: ref(name, id) })),
          }),
        }),
      }),
    }),
    batch: () => {
      const ops: { name: string; id: string }[] = [];
      const ups: { r: { name: string; id: string }; d: Record<string, unknown> }[] = [];
      return {
        delete: (r: { name: string; id: string }) => { ops.push(r); },
        update: (r: { name: string; id: string }, d: Record<string, unknown>) => { ups.push({ r, d }); },
        commit: async () => { for (const r of ops) delete store[r.name]?.[r.id]; for (const u of ups) Object.assign(store[u.r.name][u.r.id], u.d); },
      };
    },
  },
}));

const h = vi.hoisted(() => {
  class FakeAuthError extends Error { status: number; constructor(m: string, s = 401) { super(m); this.status = s; } }
  return { FakeAuthError, state: { authed: true } };
});
vi.mock('@/lib/pi-auth', () => ({
  AuthError: h.FakeAuthError,
  verifyPiAccessToken: async () => { if (!h.state.authed) throw new h.FakeAuthError('no', 401); return { uid: 'u1', username: 'ann' }; },
}));
const consume = vi.fn();
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: (...a: unknown[]) => consume(...a), clientIp: () => '1.2.3.4' }));

import { GET, DELETE } from '@/app/api/my-data/route';
import { isEraseConfirm, isSafeId, buildExport, exportFilename } from '@/lib/my-data';

const getReq = () => ({ headers: new Headers({ authorization: 'Bearer t' }) }) as never;
const delReq = (body: unknown) => ({ headers: new Headers({ authorization: 'Bearer t' }), json: async () => body }) as never;

beforeEach(() => {
  h.state.authed = true;
  consume.mockReset(); consume.mockResolvedValue({ ok: true, retryAfter: 0 });
  store = {
    profiles: { ann: { email: 'ann@example.com', emailVerified: true }, bob: { email: 'bob@example.com' } },
    preferences: { ann: { theme: 'dark' } },
    referrals: { ann: { code: 'ANN1' } },
    avatars: { ann: { preset: 'home' }, bob: { preset: 'sun' } },
    favorites: { f1: { username: 'ann', propertyId: 'p1' }, f2: { username: 'bob', propertyId: 'p2' } },
    ownerships: { o1: { uid: 'u1', amount: 10, createdAt: new Date('2026-01-02T00:00:00Z') }, o2: { uid: 'u2', amount: 99 } },
    contracts: { c1: { buyerUsername: 'ann', sellerUsername: 'bob' }, c2: { buyerUsername: 'bob', sellerUsername: 'zed' } },
    share_transfers: { t1: { fromUid: 'u1', toUid: 'u9' }, t2: { fromUid: 'u8', toUid: 'u1' }, t3: { fromUid: 'u8', toUid: 'u9' } },
    payouts: { p1: { uid: 'u1', amount: 5 } },
    stay_reviews: { r1: { uid: 'u1', rating: 5, name: 'an***', comment: 'Great' }, r2: { uid: 'u2', rating: 3, name: 'bo***' } },
  };
});

describe('helpers', () => {
  it('only accepts the exact confirmation word and safe ids', () => {
    expect(isEraseConfirm({ confirm: 'DELETE' })).toBe(true);
    for (const b of [null, {}, { confirm: 'delete' }, { confirm: true }, 'DELETE']) expect(isEraseConfirm(b)).toBe(false);
    expect(isSafeId('ann')).toBe(true);
    expect(isSafeId('a/b')).toBe(false);
    expect(isSafeId('')).toBe(false);
    expect(isSafeId('x'.repeat(129))).toBe(false);
    expect(exportFilename(new Date('2026-10-18T10:00:00Z'))).toBe('my-re-global-data-2026-10-18.json');
    expect(buildExport({ uid: 'u', username: 'n' }, { a: 1 }, new Date('2026-10-18T10:00:00Z')).exportedAt).toBe('2026-10-18T10:00:00.000Z');
  });
});

describe('GET /api/my-data', () => {
  it('returns only the signed-in user data, as a download', async () => {
    const res = await GET(getReq());
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toContain('attachment');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const out = JSON.parse(await res.text());
    expect(out.user).toEqual({ uid: 'u1', username: 'ann' });
    expect(out.data.profile.email).toBe('ann@example.com');
    expect(out.data.favorites.map((f: { id: string }) => f.id)).toEqual(['f1']);
    expect(out.data.ownerships).toHaveLength(1);
    expect(out.data.ownerships[0].createdAt).toBe('2026-01-02T00:00:00.000Z');
    expect(out.data.contracts.map((c: { id: string }) => c.id)).toEqual(['c1']);
    expect(out.data.share_transfers.map((t: { id: string }) => t.id).sort()).toEqual(['t1', 't2']);
    expect(out.data.stay_reviews.map((r: { id: string }) => r.id)).toEqual(['r1']);
    expect(JSON.stringify(out)).not.toContain('bob@example.com');
  });
  it('needs a login and respects the rate limit', async () => {
    h.state.authed = false;
    expect((await GET(getReq())).status).toBe(401);
    h.state.authed = true;
    consume.mockResolvedValue({ ok: false, retryAfter: 60 });
    const res = await GET(getReq());
    expect(res.status).toBe(429);
    expect(consume.mock.calls[0][0]).toBe('my-data-export:u1');
  });
});

describe('DELETE /api/my-data', () => {
  it('refuses without the confirmation word and deletes nothing', async () => {
    const res = await DELETE(delReq({}));
    expect(res.status).toBe(400);
    expect(store.profiles.ann).toBeDefined();
  });
  it('deletes the personal data, keeps money and contract records, and notes it without the name', async () => {
    const res = await DELETE(delReq({ confirm: 'DELETE' }));
    expect(res.status).toBe(200);
    expect(store.profiles.ann).toBeUndefined();
    expect(store.preferences.ann).toBeUndefined();
    expect(store.referrals.ann).toBeUndefined();
    expect(store.avatars.ann).toBeUndefined();
    expect(store.avatars.bob).toBeDefined();
    expect(store.favorites.f1).toBeUndefined();
    expect(store.profiles.bob).toBeDefined();
    expect(store.favorites.f2).toBeDefined();
    expect(store.ownerships.o1).toBeDefined();
    expect(store.contracts.c1).toBeDefined();
    expect(store.payouts.p1).toBeDefined();
    const rec = JSON.stringify(store.erasure_requests);
    expect(rec).not.toContain('ann');
    expect(Object.keys(store.erasure_requests)[0]).toMatch(/^[0-9a-f]{64}$/);
  });
  it('keeps guest reviews but cuts them loose from the account', async () => {
    const res = await DELETE(delReq({ confirm: 'DELETE' }));
    expect((await res.json()).anonymized).toEqual(['reviews']);
    expect(store.stay_reviews.r1).toMatchObject({ uid: '', rating: 5, comment: 'Great' });
    expect(store.stay_reviews.r2.uid).toBe('u2');
  });
  it('needs a login and respects the rate limit', async () => {
    h.state.authed = false;
    expect((await DELETE(delReq({ confirm: 'DELETE' }))).status).toBe(401);
    h.state.authed = true;
    consume.mockResolvedValue({ ok: false, retryAfter: 60 });
    expect((await DELETE(delReq({ confirm: 'DELETE' }))).status).toBe(429);
    expect(store.profiles.ann).toBeDefined();
  });
});
