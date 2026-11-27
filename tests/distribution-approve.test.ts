import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { confirmationOk, payoutIdFor, splitByKyc, type Row } from '@/lib/distribution';
import { payoutAlerts } from '@/lib/payout-alerts';
import { ALERT_LABELS } from '@/lib/alert-labels';
import { MARKET_LABELS } from '@/lib/market-labels';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

const row = (uid: string, amount: number): Row => ({ uid, username: uid, shareDays: 10, sharesAtEnd: 1, amount });
const read = (p: string) => readFileSync(p, 'utf8');
const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

describe('who gets a payout', () => {
  it('verified holders are paid, the others are held with their amount and a reason', () => {
    const { pay, held } = splitByKyc([row('a', 5), row('b', 7), row('c', 9)], new Set(['a', 'c']));
    expect(pay.map((r) => r.uid)).toEqual(['a', 'c']);
    expect(held).toEqual([{ ...row('b', 7), reason: 'identity not verified' }]);
  });
  it('an invalid account id is held, never paid', () => {
    const { pay, held } = splitByKyc([row('', 1), row('x/y', 1), row('u'.repeat(101), 1)], new Set(['', 'x/y', 'u'.repeat(101)]));
    expect(pay).toEqual([]);
    expect(held.map((h) => h.reason)).toEqual(['invalid account', 'invalid account', 'invalid account']);
  });
  it('nothing is lost: paid plus held is every row', () => {
    const rows = [row('a', 1.5), row('b', 2.25), row('c', 3)];
    const { pay, held } = splitByKyc(rows, new Set(['b']));
    expect(pay.length + held.length).toBe(rows.length);
  });
});

describe('one payout per holder per run', () => {
  it('the id is stable, so approving twice cannot pay twice', () => {
    expect(payoutIdFor('run1', 'uidA')).toBe('dist-run1-uidA');
    expect(payoutIdFor('run1', 'uidA')).toBe(payoutIdFor('run1', 'uidA'));
    expect(payoutIdFor('run2', 'uidA')).not.toBe(payoutIdFor('run1', 'uidA'));
  });
});

describe('the confirmation', () => {
  it('must be the net amount of the run', () => {
    expect(confirmationOk('900', 900)).toBe(true);
    expect(confirmationOk(' 900.0 ', 900)).toBe(true);
    expect(confirmationOk('1,234.5', 1234.5)).toBe(true);
    expect(confirmationOk(33.3333, 33.3333)).toBe(true);
    expect(confirmationOk('899.9999', 900)).toBe(false);
    expect(confirmationOk('', 900)).toBe(false);
    expect(confirmationOk(undefined, 900)).toBe(false);
    expect(confirmationOk('abc', 900)).toBe(false);
    expect(confirmationOk('0', 0.00001)).toBe(true);
  });
});

describe('the lock and the safe retry', () => {
  const server = read('lib/distribution-server.ts');
  afterEach(() => { delete process.env.DISTRIBUTIONS_ENABLED; delete process.env.PLATFORM_MODE; });
  it('is off unless the mode allows real money and the switch is exactly 1', async () => {
    const src = server.match(/export const distributionsUnlocked = \(\): boolean => (.*);/)?.[1] ?? '';
    expect(src).toBe('distributionsAllowed(platformMode(), process.env.DISTRIBUTIONS_ENABLED)');
    expect(server.indexOf('distributionsUnlocked()')).toBeLessThan(server.indexOf("collection('payouts')"));
  });
  it('approving checks the lock first, then the status and the typed amount, inside one transaction', () => {
    const a = server.slice(server.indexOf('export async function approveRun'));
    expect(a.indexOf('distributionsUnlocked()')).toBeLessThan(a.indexOf('runTransaction'));
    expect(a).toContain("d.status !== 'draft' && d.status !== 'approving'");
    expect(a).toContain('confirmationOk');
    expect(a.indexOf("status: 'approving'")).toBeLessThan(a.indexOf('.create({'));
    expect(a.indexOf('.create({')).toBeLessThan(a.indexOf("status: 'approved'"));
  });
  it('a payout that already exists is left alone, and only verified holders are paid', () => {
    expect(server).toContain('.code !== 6');
    expect(server).toContain("status === 'approved'");
    expect(server).toContain('splitByKyc');
    expect(server).not.toMatch(/payouts'\)\.doc\([^)]*\)\.(set|update)\(/);
  });
  it('the payout is pending and of its own kind, never marked paid here', () => {
    expect(server).toContain("kind: 'distribution'");
    expect(server).toContain("status: 'pending'");
    expect(server).not.toContain("status: 'paid'");
  });
  it('the route logs the approval and tells the panel whether it is unlocked', () => {
    const r = read('app/api/admin/distributions/route.ts');
    expect(r).toContain("logAdmin('distribution.approve'");
    expect(r).toContain('unlocked: distributionsUnlocked()');
  });
});

describe('what the holder sees', () => {
  it('a distribution is not shown as a sale: alerts, market page and labels', () => {
    const [sent] = payoutAlerts([{ id: 'd1', kind: 'distribution', amount: 3, status: 'paid', paidAt: new Date().toISOString() }], Date.now());
    expect(sent.titleEn).toBe('Your property income was sent');
    expect(sent.i18n?.title).toBe('distSentT');
    const [pend] = payoutAlerts([{ id: 'd2', kind: 'distribution', amount: 3, status: 'pending', createdAt: new Date().toISOString() }], Date.now());
    expect(pend.titleEn).toBe('Property income on its way');
    expect(pend.i18n?.title).toBe('distPendT');
    expect(read('app/market/page.tsx')).toContain("mk('distribution', language)");
  });
  it('the new texts exist in all 7 languages and promise nothing', () => {
    for (const k of ['distSentT', 'distPendT'] as const) for (const l of LANGS) expect((ALERT_LABELS[k] as Record<string, string>)[l], `${k} ${l}`).toBeTruthy();
    for (const l of LANGS) expect((MARKET_LABELS.distribution as Record<string, string>)[l], l).toBeTruthy();
    const all = JSON.stringify([ALERT_LABELS.distSentT, ALERT_LABELS.distPendT, MARKET_LABELS.distribution]).toLowerCase();
    expect(all).not.toMatch(/guarantee|guaranteed|profit/);
  });
  it('the admin sees the kind and the activity log has a label', () => {
    expect(read('components/admin/payouts-panel.tsx')).toContain("'توزيع عوائد'");
    expect(auditLabel('distribution.approve')).toBe('اعتماد توزيع عوائد وإنشاء مستحقات');
    expect(auditSummary('distribution.approve', { paid: 4, held: 1 })).toBe('4 مستحق · 1 محجوز');
  });
});
