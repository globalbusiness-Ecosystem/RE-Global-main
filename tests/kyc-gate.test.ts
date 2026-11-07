import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const src = (p: string) => readFileSync(p, 'utf8');

describe('identity gate on money routes', () => {
  it('the shared gate passes Pi users, blocks unless approved, and fails closed', () => {
    const s = src('lib/kyc-gate.ts');
    expect(s).toContain('if (!needsKyc(uid)) return null');
    expect(s).toContain("status !== 'approved'");
    expect(s).toContain("code: 'kyc_required'");
    expect(s).toContain('status: 503');
  });
  it('payments, contract signing and resale settlement all check it before doing anything else', () => {
    for (const [p, first] of [
      ['app/api/payments/route.ts', 'req.json('],
      ['app/api/contracts/sign/route.ts', 'req.json('],
      ['app/api/market/settle/route.ts', 'req.json('],
    ]) {
      const s = src(p);
      expect(s, p).toContain('kycBlock(');
      expect(s.indexOf('kycBlock('), p).toBeLessThan(s.indexOf(first));
    }
  });
  it('the header shows a verify link to signed-in web users', () => {
    const s = src('components/header.tsx');
    expect(s).toContain('href="/kyc"');
    expect(s).toContain("kl('verifyCta'");
  });
});
