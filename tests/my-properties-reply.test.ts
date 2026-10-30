import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
type Doc = Record<string, unknown>;
const h = vi.hoisted(() => ({ store: {} as Record<string, Record<string, Doc>> }));
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      where: (field: string, _op: string, value: unknown) => ({
        get: async () => ({
          docs: Object.entries(h.store[name] ?? {}).filter(([, d]) => d[field] === value).map(([id, d]) => ({ id, data: () => d })),
        }),
      }),
    }),
  },
}));
vi.mock('@/lib/pi-auth', () => ({
  AuthError: class extends Error { status = 401; },
  verifyPiAccessToken: async () => ({ uid: 'u1', username: 'ann' }),
}));
vi.mock('@/lib/rate-guard', () => ({ rateLimited: async () => null }));

import { GET } from '@/app/api/my-properties/route';

const req = () => ({ headers: new Headers({ authorization: 'Bearer t' }) }) as never;

beforeEach(() => {
  h.store = {
    bookings: {
      b1: { uid: 'u1', start: '2026-01-01', end: '2026-01-03', status: 'confirmed' },
      b2: { uid: 'u1', start: '2026-02-01', end: '2026-02-03', status: 'confirmed' },
      b3: { uid: 'u1', start: '2026-03-01', end: '2026-03-03', status: 'confirmed' },
    },
    stay_reviews: {
      b1: { uid: 'u1', rating: 5, reply: 'Welcome back!' },
      b2: { uid: 'u1', rating: 4 },
      other: { uid: 'u2', rating: 1, reply: 'not yours' },
    },
  };
});

describe('GET /api/my-properties host replies', () => {
  it('gives each booking the host reply to the guest own review, or an empty text', async () => {
    const out = await (await GET(req())).json();
    const by = (id: string) => out.bookings.find((b: { id: string }) => b.id === id);
    expect(by('b1')).toMatchObject({ reviewed: true, hostReply: 'Welcome back!' });
    expect(by('b2')).toMatchObject({ reviewed: true, hostReply: '' });
    expect(by('b3')).toMatchObject({ reviewed: false, hostReply: '' });
  });
  it('never leaks another guest reply', async () => {
    const out = await (await GET(req())).json();
    expect(JSON.stringify(out)).not.toContain('not yours');
  });
});
