import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { authorizePayment } from '@/lib/pi-payment-guard';

const PAYMENT_ID = 'payment_abcdef123456';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function piStub(opts: { me?: unknown; meStatus?: number; payment?: unknown; paymentStatus?: number }) {
  const fn = vi.fn(async (url: string, _init?: RequestInit) => {
    if (url.endsWith('/v2/me')) return json(opts.me ?? { uid: 'u-me', username: 'me' }, opts.meStatus ?? 200);
    if (url.includes('/payments/')) return json(opts.payment ?? {}, opts.paymentStatus ?? 200);
    throw new Error(`unexpected fetch ${url}`);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}
const req = (token?: string) =>
  new NextRequest('http://localhost/api/payments/approve', {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });

beforeEach(() => {
  process.env.PI_API_KEY = 'test-key';
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.PI_API_KEY;
});

describe('authorizePayment', () => {
  it('rejects an invalid paymentId before doing any network call', async () => {
    const f = piStub({});
    const r = await authorizePayment(req('t'), '../../x');
    expect(r).toBeInstanceOf(NextResponse);
    expect((r as NextResponse).status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated caller', async () => {
    piStub({ meStatus: 401 });
    const r = (await authorizePayment(req('bad'), PAYMENT_ID)) as NextResponse;
    expect(r.status).toBe(401);
  });

  it('refuses to act on a payment that belongs to another user (403)', async () => {
    piStub({ me: { uid: 'u-me', username: 'me' }, payment: { user_uid: 'u-victim' } });
    const r = (await authorizePayment(req('t'), PAYMENT_ID)) as NextResponse;
    expect(r.status).toBe(403);
  });

  it('refuses a payment with no owner', async () => {
    piStub({ payment: {} });
    const r = (await authorizePayment(req('t'), PAYMENT_ID)) as NextResponse;
    expect(r.status).toBe(403);
  });

  it('returns 404 / 502 for unknown or unverifiable payments', async () => {
    piStub({ paymentStatus: 404 });
    expect(((await authorizePayment(req('t'), PAYMENT_ID)) as NextResponse).status).toBe(404);
    piStub({ paymentStatus: 500 });
    expect(((await authorizePayment(req('t'), PAYMENT_ID)) as NextResponse).status).toBe(502);
  });

  it('fails closed when the Pi API key is not configured', async () => {
    delete process.env.PI_API_KEY;
    piStub({});
    expect(((await authorizePayment(req('t'), PAYMENT_ID)) as NextResponse).status).toBe(500);
  });

  it('returns the verified context when the payment belongs to the caller', async () => {
    const f = piStub({ me: { uid: 'u-me', username: 'me' }, payment: { user_uid: 'u-me', identifier: PAYMENT_ID } });
    const r = await authorizePayment(req('t'), PAYMENT_ID);
    expect(r).not.toBeInstanceOf(NextResponse);
    expect((r as any).paymentId).toBe(PAYMENT_ID);
    expect((r as any).user.username).toBe('me');
    // the server-side payment lookup must use the secret API key, not the user's token
    const lookup = f.mock.calls.find(([u]) => (u as string).includes('/payments/'))!;
    expect(((lookup[1] as RequestInit).headers as Record<string, string>).Authorization).toBe('Key test-key');
  });
});
