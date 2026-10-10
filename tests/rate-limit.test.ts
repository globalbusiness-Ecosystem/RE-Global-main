import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';
import { guardApi } from '@/lib/api-guard';

// No Firebase credentials in the test environment, so the limiter must fall back
// to its in-memory counter (this is also the behaviour during a Firestore outage).
beforeEach(() => {
  delete process.env.FIREBASE_PROJECT_ID;
  delete process.env.FIREBASE_CLIENT_EMAIL;
  delete process.env.FIREBASE_PRIVATE_KEY;
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('consumeRateLimit (in-memory fallback)', () => {
  it('allows up to the limit then blocks with a positive retryAfter', async () => {
    const key = `t:${Math.random()}`;
    const results = [];
    for (let i = 0; i < 5; i++) results.push((await consumeRateLimit(key, 3, 60_000)).ok);
    expect(results).toEqual([true, true, true, false, false]);
    const blocked = await consumeRateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('keeps keys independent', async () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    await consumeRateLimit(a, 1, 60_000);
    expect((await consumeRateLimit(a, 1, 60_000)).ok).toBe(false);
    expect((await consumeRateLimit(b, 1, 60_000)).ok).toBe(true);
  });

  it('opens a new window after it expires', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const key = `w:${Math.random()}`;
    await consumeRateLimit(key, 1, 1000);
    expect((await consumeRateLimit(key, 1, 1000)).ok).toBe(false);
    vi.setSystemTime(new Date(Date.now() + 1500));
    expect((await consumeRateLimit(key, 1, 1000)).ok).toBe(true);
  });
});

describe('clientIp', () => {
  it('uses the first x-forwarded-for entry, then x-real-ip, then "unknown"', () => {
    const r = (h: Record<string, string>) => new Request('http://x/', { headers: h });
    expect(clientIp(r({ 'x-forwarded-for': '1.2.3.4, 9.9.9.9' }))).toBe('1.2.3.4');
    expect(clientIp(r({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8');
    expect(clientIp(r({}))).toBe('unknown');
  });
});

describe('guardApi', () => {
  const me = () => new Response(JSON.stringify({ uid: 'guard-user', username: 'guard' }), { status: 200 });
  const req = (token?: string) =>
    new Request('http://localhost/api/x', { headers: token ? { authorization: `Bearer ${token}` } : {} });

  it('returns 401 without a token', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => me()));
    const r = (await guardApi(req(), { scope: `s-${Math.random()}` })) as NextResponse;
    expect(r.status).toBe(401);
  });

  it('returns the verified user, then 429 with Retry-After once the limit is hit', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => me()));
    const scope = `s-${Math.random()}`;
    const first = await guardApi(req('tok'), { scope, limit: 2 });
    expect(first).toEqual({ uid: 'guard-user', username: 'guard' });
    await guardApi(req('tok'), { scope, limit: 2 });
    const third = (await guardApi(req('tok'), { scope, limit: 2 })) as NextResponse;
    expect(third.status).toBe(429);
    expect(Number(third.headers.get('Retry-After'))).toBeGreaterThan(0);
  });
});
