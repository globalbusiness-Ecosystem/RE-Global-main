import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('server-only', () => ({}));
import { webIdentityFromClaims } from '@/lib/web-auth';
import { PASSKEY_TEXT } from '@/lib/passkeys-i18n';

const src = (p: string) => readFileSync(p, 'utf8');
const custom = (extra: Record<string, unknown> = {}) => ({ uid: 'abc123', firebase: { sign_in_provider: 'custom' }, ...extra });

describe('web identity from a fingerprint sign-in', () => {
  it('accepts a custom token only when it carries passkeyLogin', () => {
    expect(webIdentityFromClaims(custom({ passkeyLogin: true }))).toEqual({ uid: 'web_abc123', username: 'web_abc123' });
  });
  it('still refuses Pi sessions (custom token without the claim) and look-alike values', () => {
    for (const bad of [custom(), custom({ passkeyLogin: 'true' }), custom({ passkeyLogin: 1 }), custom({ passkeyLogin: false })]) expect(webIdentityFromClaims(bad)).toBeNull();
  });
  it('keeps refusing anonymous accounts and unsafe uids', () => {
    expect(webIdentityFromClaims({ uid: 'x', firebase: { sign_in_provider: 'anonymous' }, passkeyLogin: true })).toBeNull();
    expect(webIdentityFromClaims({ uid: 'a/b', firebase: { sign_in_provider: 'custom' }, passkeyLogin: true })).toBeNull();
  });
});

describe('fingerprint sign-in wiring', () => {
  const route = src('app/api/auth/passkey-login/route.ts');
  it('is rate limited per IP, one-time challenge, no account chosen by the caller', () => {
    expect(route).toMatch(/ipLimited\('passkey-login'/);
    expect(route).toMatch(/finishAuthentication\('login', OWNER, null,/);
  });
  it('only web accounts can sign in, disabled ones cannot, and the token is marked', () => {
    expect(route).toMatch(/startsWith\('web_'\)/);
    expect(route).toMatch(/account\.disabled/);
    expect(route).toMatch(/passkeyLogin: true/);
  });
  it('the app keeps such a session as a web account (and Pi custom sessions still ignored)', () => {
    expect(src('contexts/pi-auth-context.tsx')).toMatch(/signInProvider === "custom" && res\.claims\.passkeyLogin !== true/);
  });
  it('the sign-in page offers the fingerprint only where the device supports it', () => {
    const p = src('app/login/page.tsx');
    expect(p).toMatch(/canFinger &&/);
    expect(p).toMatch(/loginWithPasskey/);
  });
  it('texts exist in all 7 languages', () => {
    for (const k of ['signInFinger', 'signInFingerFail', 'signInFingerHint'] as const) {
      const e = PASSKEY_TEXT[k] as Record<string, string>;
      expect(Object.keys(e)).toHaveLength(7);
      for (const v of Object.values(e)) expect(v.trim().length).toBeGreaterThan(0);
    }
  });
});
