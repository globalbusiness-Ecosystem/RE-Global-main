import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createAdminToken,
  verifyAdminToken,
  isAdminRequest,
  isAdminSessionConfigured,
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_SECONDS,
} from '@/lib/admin-session';

const SECRET = 'x'.repeat(40);

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = SECRET;
});
afterEach(() => {
  vi.useRealTimers();
  delete process.env.ADMIN_SESSION_SECRET;
});

describe('admin session token', () => {
  it('round-trips a fresh token', async () => {
    const t = await createAdminToken();
    expect(t).toBeTruthy();
    expect(await verifyAdminToken(t)).toBe(true);
  });

  it('is unusable when the secret is missing or shorter than 32 chars', async () => {
    process.env.ADMIN_SESSION_SECRET = 'short';
    expect(isAdminSessionConfigured()).toBe(false);
    expect(await createAdminToken()).toBeNull();
    delete process.env.ADMIN_SESSION_SECRET;
    expect(await verifyAdminToken('a.b')).toBe(false);
  });

  it('rejects a tampered payload (forged expiry)', async () => {
    const t = (await createAdminToken())!;
    const [, sig] = t.split('.');
    const forged = Buffer.from(JSON.stringify({ v: 1, exp: 9999999999 })).toString('base64url');
    expect(await verifyAdminToken(`${forged}.${sig}`)).toBe(false);
  });

  it('rejects a tampered signature and malformed tokens', async () => {
    const t = (await createAdminToken())!;
    const [payload] = t.split('.');
    expect(await verifyAdminToken(`${payload}.AAAA`)).toBe(false);
    expect(await verifyAdminToken('nodots')).toBe(false);
    expect(await verifyAdminToken('a.b.c')).toBe(false);
    expect(await verifyAdminToken('')).toBe(false);
    expect(await verifyAdminToken(undefined)).toBe(false);
  });

  it('rejects a token signed with a different secret', async () => {
    const t = (await createAdminToken())!;
    process.env.ADMIN_SESSION_SECRET = 'y'.repeat(40);
    expect(await verifyAdminToken(t)).toBe(false);
  });

  it('expires after the session TTL', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const t = (await createAdminToken())!;
    vi.setSystemTime(new Date(Date.now() + (ADMIN_SESSION_TTL_SECONDS - 60) * 1000));
    expect(await verifyAdminToken(t)).toBe(true);
    vi.setSystemTime(new Date(Date.now() + 120 * 1000));
    expect(await verifyAdminToken(t)).toBe(false);
  });

  it('isAdminRequest reads the admin cookie', async () => {
    const t = (await createAdminToken())!;
    const withCookie = { cookies: { get: (n: string) => (n === ADMIN_COOKIE_NAME ? { value: t } : undefined) } };
    const without = { cookies: { get: () => undefined } };
    expect(await isAdminRequest(withCookie)).toBe(true);
    expect(await isAdminRequest(without)).toBe(false);
  });
});

describe('revoking admin sessions', () => {
  it('cuts off sessions issued before the revoke, keeps later ones', async () => {
    const { revokeAllSessions, _resetRevokeCache } = await import('@/lib/admin-revoke');
    const { isAdminRequest } = await import('@/lib/admin-guard');
    const { adminTokenIssuedAt } = await import('@/lib/admin-session');
    _resetRevokeCache();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    const old = (await createAdminToken())!;
    expect(adminTokenIssuedAt(old)).toBe(Math.floor(Date.now() / 1000));
    const req = (t: string) => ({ cookies: { get: (n: string) => (n === ADMIN_COOKIE_NAME ? { value: t } : undefined) } });
    expect(await isAdminRequest(req(old))).toBe(true);
    vi.setSystemTime(new Date('2026-01-01T10:05:00Z'));
    await revokeAllSessions();
    expect(await isAdminRequest(req(old))).toBe(false);
    vi.setSystemTime(new Date('2026-01-01T10:06:00Z'));
    const fresh = (await createAdminToken())!;
    expect(await isAdminRequest(req(fresh))).toBe(true);
    _resetRevokeCache();
  });

  it('treats tokens without a timestamp as issued at 0', async () => {
    const { adminTokenIssuedAt } = await import('@/lib/admin-session');
    expect(adminTokenIssuedAt('garbage')).toBe(0);
    expect(adminTokenIssuedAt(undefined)).toBe(0);
  });
});
