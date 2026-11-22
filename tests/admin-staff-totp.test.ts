import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { totpGate, otpauthUri, isFreshStep } from '@/lib/admin-staff-totp';
import { generateSecret, hotp, base32Decode, matchTotp } from '@/lib/totp';
import { groupOf } from '@/lib/admin-roles';

const src = (p: string) => readFileSync(p, 'utf8');

describe('what a login needs after the PIN', () => {
  it('an account with an app needs a code', () => {
    expect(totpGate({ enrolled: true, required: false, code: undefined })).toBe('needCode');
    expect(totpGate({ enrolled: true, required: true, code: '  ' })).toBe('needCode');
    expect(totpGate({ enrolled: true, required: false, code: '123456' })).toBe('check');
  });
  it('without an app: set it up when the owner requires it, otherwise the PIN is enough', () => {
    expect(totpGate({ enrolled: false, required: true, code: '123456' })).toBe('needEnroll');
    expect(totpGate({ enrolled: false, required: false, code: undefined })).toBe('ok');
  });
  it('a code works once: its step must be newer than the last accepted one', () => {
    expect(isFreshStep(100, 99)).toBe(true);
    expect(isFreshStep(100, 100)).toBe(false);
    expect(isFreshStep(null, 0)).toBe(false);
  });
  it('the app link carries the account and the secret', () => {
    const s = generateSecret();
    const u = otpauthUri('sara', s);
    expect(u.startsWith('otpauth://totp/')).toBe(true);
    expect(u).toContain(`secret=${s}`);
    expect(u).toContain('sara');
  });
  it('the same secret and clock give the code the app would show', () => {
    const s = generateSecret();
    const now = 1_700_000_000_000;
    const code = hotp(base32Decode(s)!, Math.floor(now / 1000 / 30));
    expect(matchTotp(s, code, now)).toBe(Math.floor(now / 1000 / 30));
    expect(matchTotp(s, '000000', now)).toBeNull();
  });
});

describe('wiring', () => {
  it('the secret is stored encrypted, and set-up needs the PIN', () => {
    const a = src('lib/admin-accounts.ts');
    expect(a).toContain('secret: encryptField(secret)');
    expect(a).toContain('decryptField(d.totp.secret)');
    expect((a.match(/loadStaff\(username, pin\)/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(a).toContain("'totp.lastStep': step");
  });
  it('a wrong code counts as a failed attempt, a missing code does not leak anything before the PIN is right', () => {
    const r = src('app/api/admin-auth/staff/route.ts');
    expect(r.indexOf('needCode')).toBeLessThan(r.indexOf('registerFailure(key)'));
    expect(r).toContain('badCode');
    expect(r).toContain("{ ok: false }, { status: 401 }");
    const t = src('app/api/admin-auth/staff-totp/route.ts');
    expect(t).toContain('loginGate(');
    expect(t).toContain('consumeRateLimit(');
    expect(t).toContain('registerFailure(key)');
  });
  it('the policy and the reset are owner-only, and the screens use them', () => {
    expect(groupOf('/api/admin/staff-security')).toBe('owner');
    expect(src('app/api/admin/admins/route.ts')).toContain("case 'resetTotp'");
    expect(src('components/admin/admins-panel.tsx')).toContain('/api/admin/staff-security');
    expect(src('components/admin/admins-panel.tsx')).toContain("action: 'resetTotp'");
    const p = src('app/admin/page.tsx');
    expect(p).toContain('/api/admin-auth/staff-totp');
    expect(p).toContain('needEnroll');
  });
});
