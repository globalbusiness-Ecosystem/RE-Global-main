import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { isFinalRedeemStatus } from '@/lib/ref-code';
import { PARTNER_TEXT } from '@/lib/partners-i18n';

const src = (p: string) => readFileSync(p, 'utf8');

describe('invite code is kept until the server gives a final answer', () => {
  it('only 200/400/404/409 are final', () => {
    for (const s of [200, 400, 404, 409]) expect(isFinalRedeemStatus(s)).toBe(true);
    for (const s of [401, 403, 429, 500, 502, 503]) expect(isFinalRedeemStatus(s)).toBe(false);
  });
  it('RefCapture clears the code only through that check and tells the person the result', () => {
    const s = src('components/ref-capture.tsx');
    expect(s).toContain('isFinalRedeemStatus(res.status)');
    expect(s).not.toMatch(/\.then\(\(\) => \{ try \{ localStorage\.removeItem/);
    expect(s).toContain("pt('refOk'");
    expect(s).toContain("pt('refNotNew'");
  });
  it('the new messages exist in all seven languages', () => {
    for (const k of ['refOk', 'refNotNew', 'refNotFound'] as const) {
      const row = PARTNER_TEXT[k] as Record<string, string>;
      expect(Object.values(row).filter(Boolean)).toHaveLength(7);
    }
  });
});

describe('admin referral tool', () => {
  const route = src('app/api/admin/partner-referrals/route.ts');
  it('is admin-only on both methods', () => {
    expect(route.match(/isAdminRequest\(req\)/g)?.length).toBe(2);
  });
  it('links only to an approved partner, refuses self/mutual, asks force to move, logs, and writes the commission lines', () => {
    expect(route).toContain("partner.status !== 'approved'");
    expect(route).toContain('Same account');
    expect(route).toContain('Mutual');
    expect(route).toContain('body?.force !== true');
    expect(route).toContain("logAdmin('partner.referral.link'");
    expect(route).toContain('syncCommissions(partnerAcc.username, partner)');
  });
  it('is shown in the partners sub-tab', () => {
    expect(src('components/admin/payments-tab.tsx')).toContain('<PartnerReferralsPanel');
    expect(src('components/admin/partner-referrals-panel.tsx')).toContain('/api/admin/partner-referrals');
  });
});
