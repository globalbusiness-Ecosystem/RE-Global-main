import { describe, it, expect, afterEach, vi } from 'vitest';

const h = vi.hoisted(() => ({ claims: null as Record<string, unknown> | null, verified: [] as string[] }));
vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: async (t: string) => {
      h.verified.push(t);
      if (!h.claims) throw new Error('bad token');
      return h.claims;
    },
  },
}));
const banned = new Set<string>();
vi.mock('@/lib/ban-list', () => ({ isBanned: async (u: string) => banned.has(u) }));

import { webIdentityFromClaims, verifyWebToken, looksLikeJwt } from '@/lib/web-auth';
import { verifyPiAccessToken, _clearPiAuthCache } from '@/lib/pi-auth';

const JWT = 'eyJhbGciOiJSUzI1NiJ9.eyJ1aWQiOiJ4In0.c2lnbmF0dXJlLWJ5dGVz';
afterEach(() => { h.claims = null; h.verified = []; banned.clear(); _clearPiAuthCache(); vi.unstubAllGlobals(); });

describe('web identities', () => {
  it('accepts Google, e-mail link and Apple accounts with a verified e-mail, in their own "web_" name space', () => {
    for (const p of ['google.com', 'password', 'apple.com', 'emailLink']) {
      const id = webIdentityFromClaims({ uid: 'abc123xyz789', email_verified: true, firebase: { sign_in_provider: p } });
      expect(id).toEqual({ uid: 'web_abc123xyz789', username: 'web_abc123xyz7' });
    }
  });
  it('accepts phone sign-in (it has no e-mail to verify)', () => {
    expect(webIdentityFromClaims({ uid: 'u1', firebase: { sign_in_provider: 'phone' } })).not.toBeNull();
  });
  it('refuses unverified e-mails, anonymous users and the Firebase tokens of Pi users', () => {
    expect(webIdentityFromClaims({ uid: 'u1', email_verified: false, firebase: { sign_in_provider: 'password' } })).toBeNull();
    expect(webIdentityFromClaims({ uid: 'u1', firebase: { sign_in_provider: 'google.com' } })).toBeNull();
    expect(webIdentityFromClaims({ uid: 'u1', email_verified: true, firebase: { sign_in_provider: 'anonymous' } })).toBeNull();
    expect(webIdentityFromClaims({ uid: 'u1', email_verified: true, firebase: { sign_in_provider: 'custom' } })).toBeNull();
    expect(webIdentityFromClaims({ uid: 'u1', email_verified: true })).toBeNull();
  });
  it('refuses odd uids', () => {
    for (const uid of ['', 'a/b', 'x'.repeat(200), 5, undefined]) {
      expect(webIdentityFromClaims({ uid, email_verified: true, firebase: { sign_in_provider: 'google.com' } })).toBeNull();
    }
  });
  it('web accounts live in their own web_ name space', () => {
    const id = webIdentityFromClaims({ uid: 'someone', email_verified: true, firebase: { sign_in_provider: 'google.com' } })!;
    expect(id.uid.startsWith('web_')).toBe(true);
    expect(id.username.startsWith('web_')).toBe(true);
  });
});

describe('verifyWebToken', () => {
  it('only looks at JWT-shaped tokens, so Pi tokens never reach Firebase', async () => {
    expect(looksLikeJwt('opaque-pi-token')).toBe(false);
    expect(looksLikeJwt(JWT)).toBe(true);
    expect(await verifyWebToken('opaque-pi-token')).toBeNull();
    expect(h.verified).toEqual([]);
  });
  it('returns null for a token Firebase rejects', async () => {
    h.claims = null;
    expect(await verifyWebToken(JWT)).toBeNull();
  });
  it('returns the identity for a good token', async () => {
    h.claims = { uid: 'g1', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
    expect(await verifyWebToken(JWT)).toEqual({ uid: 'web_g1', username: 'web_g1' });
  });
});

describe('verifyPiAccessToken now also accepts web sign-in', () => {
  it('a good Google token is accepted without calling Pi', async () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f);
    h.claims = { uid: 'g1', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
    const u = await verifyPiAccessToken(JWT);
    expect(u.uid).toBe('web_g1');
    expect(f).not.toHaveBeenCalled();
  });
  it('a banned web account is refused with 403', async () => {
    h.claims = { uid: 'g1', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
    banned.add('web_g1');
    await expect(verifyPiAccessToken(JWT)).rejects.toMatchObject({ status: 403 });
  });
  it('a JWT-shaped token that Firebase rejects still goes to Pi, and Pi says no', async () => {
    h.claims = null;
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })));
    await expect(verifyPiAccessToken(JWT)).rejects.toMatchObject({ status: 401 });
  });
  it('an ordinary Pi token never touches Firebase', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ uid: 'p1', username: 'alice' }), { status: 200 })));
    const u = await verifyPiAccessToken('plain-pi-token');
    expect(u).toMatchObject({ uid: 'p1', username: 'alice' });
    expect(h.verified).toEqual([]);
  });
});
