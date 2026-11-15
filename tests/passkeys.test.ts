import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { allowedOrigins, matchOrigin, rpIdOf, cleanLabel, isCredentialId, challengeExpired, deviceNameFromUA, MAX_PASSKEYS } from '@/lib/passkeys';
import { PASSKEY_TEXT, pk, passkeyErrorKey } from '@/lib/passkeys-i18n';

const src = (p: string) => readFileSync(p, 'utf8');

describe('passkey origins', () => {
  it('allows the default site and only adds https extras', () => {
    const o = allowedOrigins({ NODE_ENV: 'production', PASSKEY_ORIGINS: 'https://re.example.com/, http://evil.test, https://a b.com, javascript:alert(1)' });
    expect(o).toEqual(['https://re-global-main.vercel.app', 'https://re.example.com']);
  });
  it('allows localhost only outside production', () => {
    expect(allowedOrigins({ NODE_ENV: 'development' })).toContain('http://localhost:3000');
    expect(allowedOrigins({ NODE_ENV: 'production' })).not.toContain('http://localhost:3000');
  });
  it('matches the reported origin exactly (trailing slash ok, look-alikes refused)', () => {
    const a = ['https://re-global-main.vercel.app'];
    expect(matchOrigin('https://re-global-main.vercel.app/', a)).toBe('https://re-global-main.vercel.app');
    for (const bad of ['https://re-global-main.vercel.app.evil.com', 'http://re-global-main.vercel.app', '', null, 5]) expect(matchOrigin(bad, a)).toBeNull();
  });
  it('the relying party id is the host name', () => expect(rpIdOf('https://re-global-main.vercel.app')).toBe('re-global-main.vercel.app'));
});

describe('passkey helpers', () => {
  it('cleans the device name', () => {
    expect(cleanLabel('  iPhone   <b>15</b>\u0000 ')).toBe('iPhone b 15 /b');
    expect(cleanLabel('')).toBe('My device');
    expect(cleanLabel('x'.repeat(100))).toHaveLength(40);
    expect(cleanLabel(5, 'Fallback')).toBe('Fallback');
  });
  it('accepts only base64url credential ids', () => {
    expect(isCredentialId('AbCdEfGhIjKlMnOp_-12')).toBe(true);
    for (const bad of ['short', 'has/slash/aaaaaaaaaaaaaaaa', 'a'.repeat(513), '', null]) expect(isCredentialId(bad)).toBe(false);
  });
  it('knows when a challenge ran out', () => {
    expect(challengeExpired(1000, 2000)).toBe(true);
    expect(challengeExpired(3000, 2000)).toBe(false);
    expect(challengeExpired(NaN)).toBe(true);
  });
  it('limits the number of passkeys per account', () => expect(MAX_PASSKEYS).toBeGreaterThanOrEqual(2));
});

describe('passkey texts', () => {
  it('exist in all seven languages', () => {
    for (const [k, row] of Object.entries(PASSKEY_TEXT)) for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh']) expect((row as Record<string, string>)[l]?.trim(), `${k}.${l}`).toBeTruthy();
    expect(pk('add', 'xx')).toBe('Add this device');
  });
  it('maps server errors to messages', () => {
    expect(passkeyErrorKey('duplicate')).toBe('e_duplicate');
    expect(passkeyErrorKey('limit')).toBe('e_limit');
    expect(passkeyErrorKey('origin')).toBe('e_origin');
    expect(passkeyErrorKey('x')).toBe('e_generic');
  });
});

describe('passkey wiring and safety', () => {
  const server = src('lib/passkeys-server.ts');
  it('registration demands user verification, no attestation and checks origin + rp id', () => {
    expect(server).toContain("userVerification: 'required'");
    expect(server).toContain("attestationType: 'none'");
    expect(server).toContain('requireUserVerification: true');
    expect(server).toContain('expectedRPID');
    expect(server).toContain('expectedOrigin');
  });
  it('a challenge is deleted when read (single use) and tied to purpose and owner', () => {
    expect(server).toContain('tx.delete(ref)');
    expect(server).toContain('d.purpose !== purpose || d.uid !== uid');
  });
  it('the key list never returns key material', () => {
    const view = server.match(/const toView[^\n]*/)![0];
    expect(view).not.toContain('publicKey');
    expect(view).not.toContain('counter');
  });
  it('the routes need a signed-in person, and removing checks ownership', () => {
    for (const f of ['app/api/passkeys/route.ts', 'app/api/passkeys/register/options/route.ts', 'app/api/passkeys/register/verify/route.ts']) expect(src(f), f).toContain('verifyPiAccessToken');
    expect(server).toContain('.uid !== uid');
  });
  it('the settings card hides itself when the browser cannot do it, and is mounted in settings', () => {
    expect(src('components/passkey-settings.tsx')).toContain('if (!supported || !accessToken) return null');
    expect(src('components/pages/settings-page.tsx')).toContain('<PasskeySettings');
    expect(src('lib/passkey-client.ts')).toContain('platformAuthenticatorIsAvailable');
  });
});

describe('device name and the fingerprint scanner', () => {
  it('names the device from the browser text', () => {
    expect(deviceNameFromUA('Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36')).toBe('Android · Chrome');
    expect(deviceNameFromUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile Safari/604.1')).toBe('iPhone · Safari');
    expect(deviceNameFromUA('Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile PiBrowser/1.0')).toBe('Android · Pi Browser');
    expect(deviceNameFromUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126 Safari/537.36 Edg/126.0')).toBe('Windows · Edge');
    expect(deviceNameFromUA('')).toBe('My device');
    expect(deviceNameFromUA(undefined)).toBe('My device');
  });
  it('the settings card uses the scanner button with its four states and the device name', () => {
    const card = src('components/passkey-settings.tsx');
    expect(card).toContain('<FingerprintScanner');
    expect(card).toContain('deviceNameFromUA(navigator.userAgent)');
    for (const st of ["'scanning'", "'success'", "'error'"]) expect(card).toContain(st);
    const sc = src('components/fingerprint-scanner.tsx');
    expect(sc).toContain('prefers-reduced-motion');
    expect(sc).toContain('aria-live="polite"');
    expect(sc).toContain('aria-label={label}');
  });
});
