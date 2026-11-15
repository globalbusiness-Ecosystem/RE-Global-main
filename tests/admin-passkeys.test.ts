import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ADMIN_PASSKEY_UID } from '@/lib/admin-passkeys';

const src = (p: string) => readFileSync(p, 'utf8');

describe('admin sign-in with a fingerprint', () => {
  const route = src('app/api/admin-auth/passkey/route.ts');
  it('asks for the PIN before anything else, behind the same lock-out and attempt budget', () => {
    expect(route).toContain('loginGate(req, key)');
    expect(route).toContain("ipLimited('admin-passkey'");
    expect(route.indexOf('loginGate')).toBeLessThan(route.indexOf('safeEqual(body.pin'));
    expect(route.indexOf('safeEqual(body.pin')).toBeLessThan(route.indexOf("body.step === 'options'"));
    expect(route).toMatch(/safeEqual\(body\.pin[\s\S]*registerFailure\(key\)/);
  });
  it('only the admin passkeys can sign in, a bad answer counts as a failed attempt and success opens the normal session', () => {
    expect(route).toContain("finishAuthentication('admin', ADMIN_PASSKEY_UID, ADMIN_PASSKEY_UID");
    expect(route).toMatch(/if \(!r\.ok\) \{\s*await registerFailure\(key\)/);
    expect(route).toContain("completeAdminLogin(req, key, 'passkey')");
  });
  it('the PIN sign-in keeps its shape and shares the same guard code', () => {
    const pin = src('app/api/admin-auth/route.ts');
    for (const n of ['loginGate(req, key)', 'completeAdminLogin(req, key,', 'matchTotp(totpSecret, code)', 'acceptStep(step)']) expect(pin).toContain(n);
    const guard = src('lib/admin-login-guard.ts');
    for (const n of ['MAX_FAILURES = 5', 'LOCK_MINUTES = 15', "sameSite: 'strict'", 'httpOnly: true', "logAdmin('admin.login'"]) expect(guard).toContain(n);
  });
  it('can make the fingerprint mandatory once one exists, without locking out when none exists', () => {
    const pin = src('app/api/admin-auth/route.ts');
    expect(pin).toContain("process.env.ADMIN_PASSKEY_REQUIRED === '1' && (await adminHasPasskeys())");
    expect(src('lib/admin-passkeys.ts')).toContain('catch { return false; }');
  });
  it('the admin passkeys have a fixed owner that is not a real account id', () => {
    expect(ADMIN_PASSKEY_UID).toBe('admin:panel');
  });
});

describe('managing admin passkeys', () => {
  it('every management route needs an open admin session', () => {
    for (const f of ['app/api/admin/passkeys/route.ts', 'app/api/admin/passkeys/register/options/route.ts', 'app/api/admin/passkeys/register/verify/route.ts']) {
      expect(src(f), f).toContain('isAdminRequest(req)');
      expect(src(f), f).toContain('ADMIN_PASSKEY_UID');
    }
  });
  it('adding and removing are written to the activity log', () => {
    expect(src('app/api/admin/passkeys/register/verify/route.ts')).toContain("logAdmin('admin.passkey.add'");
    expect(src('app/api/admin/passkeys/route.ts')).toContain("logAdmin('admin.passkey.remove'");
  });
  it('the panel is in the dashboard security tab and the login page has the button only when it can work', () => {
    expect(src('components/admin/dashboard-tab.tsx')).toContain('<AdminPasskeysPanel');
    const page = src('app/admin/page.tsx');
    expect(page).toContain('hasPasskey && deviceCanPasskey');
    expect(page).toContain("'/api/admin-auth/passkey'");
    expect(src('lib/passkey-client.ts')).toContain("base = '/api/passkeys'");
  });
});
