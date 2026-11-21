import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canKyc, needsKyc } from '@/lib/kyc-rules';

const src = (p: string) => readFileSync(p, 'utf8');

describe('platform KYC for Pi and web accounts', () => {
  it('everyone can send a request; only web sign-ins must by default', () => {
    expect(canKyc('3f2b8c1e-aaaa-bbbb-cccc-123456789012')).toBe(true);
    expect(canKyc('web_abc')).toBe(true);
    expect(canKyc('')).toBe(false);
    expect(canKyc('a/b')).toBe(false);
    expect(needsKyc('3f2b8c1e-aaaa-bbbb-cccc-123456789012')).toBe(false);
    expect(needsKyc('web_abc')).toBe(true);
  });
  it('the KYC routes accept Pi accounts, and the photo store no longer insists on web ids', () => {
    for (const f of ['app/api/kyc/request/route.ts', 'app/api/kyc/files/route.ts', 'app/api/kyc/contract-name/route.ts']) expect(src(f), f).toContain('canKyc(user.uid)');
    expect(src('lib/kyc-files-store.ts')).not.toContain("startsWith('web_')");
    expect(src('app/api/admin/kyc/file/route.ts')).toContain('canKyc(uid)');
  });
  it('the identity company is only used for web sign-ins; Pi accounts are reviewed by the team', () => {
    expect(src('app/api/kyc/request/route.ts')).toContain('needsKyc(user.uid) ? activeKycProvider() : null');
    expect(src('app/api/kyc/me/route.ts')).toContain('web && activeKycProvider()');
  });
  it('the ID number is stored privately and shown to the team', () => {
    expect(src('lib/kyc-store.ts')).toContain('idNumber: encryptField(input.idNumber)');
    expect(src('components/admin/kyc-panel.tsx')).toContain('r.idNumber');
  });
});

describe('the rule for everyone is a team switch, off by default', () => {
  it('the policy defaults to off and the gate reads it', () => {
    const p = src('lib/kyc-policy.ts');
    expect(p).toContain('requireAll: false');
    expect(src('lib/kyc-gate.ts')).toContain('!(await getKycPolicy()).requireAll');
  });
  it('the switch route is admin-only and logged', () => {
    const r = src('app/api/admin/kyc-policy/route.ts');
    expect(r.match(/isAdminRequest/g)?.length).toBe(3);
    expect(r).toContain("logAdmin('kyc.policy'");
  });
  it('a Pi payment is checked before it is approved', () => {
    const s = src('app/api/payments/approve/route.ts');
    expect(s).toContain('kycBlock(ctx.user.uid)');
    expect(s.indexOf('kycBlock(ctx.user.uid)')).toBeLessThan(s.indexOf('reserveListing('));
  });
});

describe('the person sees the result', () => {
  it('settings show the status card with a link to /kyc', () => {
    expect(src('components/pages/settings-page.tsx')).toContain('<KycStatusCard language={language} />');
    expect(src('components/kyc-status-card.tsx')).toContain('href="/kyc"');
  });
});
