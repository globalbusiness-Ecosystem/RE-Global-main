import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LOGIN_LABELS, ll, type LoginLabelKey } from '@/lib/login-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(LOGIN_LABELS) as LoginLabelKey[];
const src = (p: string) => readFileSync(p, 'utf8');

describe('login labels', () => {
  it('has all 7 languages, non-empty, and ar/ur/zh differ from English', () => {
    for (const k of keys) for (const l of LANGS) expect(LOGIN_LABELS[k][l].trim().length, `${k}.${l}`).toBeGreaterThan(0);
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(LOGIN_LABELS[k][l]).not.toBe(LOGIN_LABELS[k].en);
  });
  it('falls back to English for hostile codes and fills placeholders', () => {
    for (const bad of ['__proto__', 'constructor', 'xx', undefined]) expect(ll('title', bad)).toBe('Sign in');
    expect(ll('linkSent', 'fr', { email: 'a@b.co' })).toContain('a@b.co');
    expect(ll('linkSent', 'fr', { email: 'a@b.co' })).not.toContain('{email}');
  });
  it('keeps placeholders in every language of the keys that use them', () => {
    for (const l of LANGS) { expect(LOGIN_LABELS.linkSent[l]).toContain('{email}'); expect(LOGIN_LABELS.signedInAs[l]).toContain('{email}'); }
  });
  it('every key is used by the login page or the market link', () => {
    const page = src('app/login/page.tsx') + src('app/market/page.tsx') + src('components/header.tsx');
    for (const k of keys) expect(page, k).toContain(`ll('${k}'`);
  });
});

describe('web sign-in wiring', () => {
  it('the auth context follows Firebase only outside the Pi Browser and ignores Pi-minted custom sessions', () => {
    const s = src('contexts/pi-auth-context.tsx');
    expect(s).toContain('onIdTokenChanged(firebaseAuth');
    expect(s).toContain('signInProvider === "custom"');
    expect(s.indexOf('onIdTokenChanged(firebaseAuth')).toBeLessThan(s.indexOf('// Pi Browser flow'));
  });
  it('does not weaken the enforced CSP', () => {
    const c = src('next.config.mjs');
    expect(c).toContain("frame-ancestors 'self' https://sandbox.minepi.com");
  });
});

describe('Pi Browser detection', () => {
  it('does not rely on window.Pi, which the layout script defines in every browser', () => {
    expect(src('app/layout.tsx')).toContain('sdk.minepi.com/pi-sdk.js');
    expect(src('lib/pi-env.ts')).toContain('PiBrowser');
    expect(src('contexts/pi-auth-context.tsx')).toContain('detectPiBrowser()');
    expect(src('components/header.tsx')).toContain('!isPiBrowser()');
  });
});
