import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { auditLabel } from '@/lib/audit-labels';

const read = (p: string) => readFileSync(p, 'utf8');

describe('distribution calculates and saves drafts; only approve creates payouts', () => {
  it('the route is guarded, never cached, and logged', () => {
    const s = read('app/api/admin/distributions/route.ts');
    expect(s).toContain('isAdminRequest');
    expect(s).toContain('no-store');
    expect(s).toContain("logAdmin('distribution.save'");
    expect(s).toContain("logAdmin('distribution.cancel'");
  });
  it('the distribution code never touches a balance or a share count, and only approve writes payouts', () => {
    for (const f of ['lib/distribution.ts', 'lib/distribution-server.ts', 'app/api/admin/distributions/route.ts']) {
      const s = read(f);
      expect(s, f).not.toMatch(/walletBalances|sharesSold|share_holdings'\)\.(doc|add)|\.(set|update)\(.*share_/);
    }
    const server = read('lib/distribution-server.ts');
    expect(server.match(/collection\('payouts'\)/g)?.length).toBe(1);
    expect([...new Set([...server.matchAll(/adminDb\.collection\('([a-z_]+)'\)/g)].map((m) => m[1]))].sort()).toEqual(['distributions', 'kyc', 'payouts', 'properties', 'share_holdings', 'share_transfers']);
    expect(server).toContain("tx.update(ref, { status: 'cancelled'");
  });
  it('the ledger counts only confirmed purchases and transfers', () => {
    const s = read('lib/distribution-server.ts');
    expect(s.match(/status !== 'confirmed'/g)?.length).toBe(2);
  });
  it('only a draft can be cancelled, and runs for the same days are refused', () => {
    const s = read('lib/distribution-server.ts');
    expect(s).toContain("'Only a draft can be cancelled'");
    expect(s).toContain('periodsOverlap');
  });
  it('the activity log has labels', () => {
    expect(auditLabel('distribution.save')).toBe('حفظ مسودة توزيع عوائد');
    expect(auditLabel('distribution.cancel')).toBe('إلغاء مسودة توزيع عوائد');
  });
  it('the panel can preview, save, open, cancel, export and (when unlocked) approve, and never marks anything paid', () => {
    const s = read('components/admin/distributions-panel.tsx');
    for (const a of ["'preview'", "'save'", "'approve'"]) expect(s).toContain(a);
    expect(s).not.toMatch(/markPaid|status: 'paid'/);
  });
});
