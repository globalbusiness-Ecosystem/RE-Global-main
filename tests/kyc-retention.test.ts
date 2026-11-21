import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { cleanRetention, cutoffMs, isDue, DEFAULT_RETENTION, KYC_CONSENT_VERSION } from '@/lib/kyc-retention';
import { KYC_LABELS } from '@/lib/kyc-labels';

const src = (p: string) => readFileSync(p, 'utf8');
const NOW = new Date('2026-11-21T12:00:00Z');
const YEARS = (n: number) => NOW.getTime() - n * 365.25 * 24 * 3600 * 1000;

describe('retention policy', () => {
  it('starts at 5 years with automatic deletion off', () => {
    expect(DEFAULT_RETENTION).toEqual({ years: 5, autoDelete: false });
    expect(cleanRetention(undefined)).toEqual({ years: 5, autoDelete: false });
  });
  it('accepts whole years from 1 to 30 and a real boolean, nothing else', () => {
    expect(cleanRetention({ years: 7, autoDelete: true })).toEqual({ years: 7, autoDelete: true });
    expect(cleanRetention({ years: '8', autoDelete: 'yes' })).toEqual({ years: 8, autoDelete: false });
    for (const bad of [0, 31, 2.5, -1, 'x', null]) expect(cleanRetention({ years: bad }).years).toBe(5);
  });
  it('the cutoff is the given number of calendar years back', () => {
    expect(new Date(cutoffMs(NOW, 5)).toISOString()).toBe('2021-11-21T12:00:00.000Z');
  });
});

describe('what is due', () => {
  const cut = cutoffMs(NOW, 5);
  it('is due only when the decision is older than the cutoff', () => {
    expect(isDue({ status: 'approved', decidedAtMs: YEARS(6) }, cut)).toBe(true);
    expect(isDue({ status: 'rejected', decidedAtMs: YEARS(5.5) }, cut)).toBe(true);
    expect(isDue({ status: 'approved', decidedAtMs: YEARS(4) }, cut)).toBe(false);
  });
  it('uses the request date for a request that was never decided', () => {
    expect(isDue({ status: 'pending', submittedAtMs: YEARS(6) }, cut)).toBe(true);
    expect(isDue({ status: 'pending', submittedAtMs: YEARS(1) }, cut)).toBe(false);
  });
  it('never deletes a legal hold, an already deleted stub, an empty record or one with no date', () => {
    expect(isDue({ status: 'approved', decidedAtMs: YEARS(20), hold: true }, cut)).toBe(false);
    expect(isDue({ status: 'none', decidedAtMs: YEARS(20), purgedAt: {} }, cut)).toBe(false);
    expect(isDue({ status: 'none' }, cut)).toBe(false);
    expect(isDue({ status: 'approved' }, cut)).toBe(false);
  });
});

describe('wiring', () => {
  it('deletion removes the photos and every personal field, refuses a hold, and is logged', () => {
    const s = src('lib/kyc-retention-store.ts');
    expect(s).toContain('deleteKycFiles(uid)');
    for (const f of ['idNumber', 'phone', 'legalName', 'idHash']) expect(s).toContain(`${f}: gone`);
    expect(s).toContain("=== true) return 'hold'");
    expect(s).toContain("logAdmin('kyc.purge'");
  });
  it('the admin route is admin-only and deleting needs an explicit confirm', () => {
    const r = src('app/api/admin/kyc-retention/route.ts');
    expect((r.match(/isAdminRequest\(/g) ?? []).length).toBe(3);
    expect(r).toContain('b.confirm === true');
  });
  it('the daily job deletes identity data only when automatic deletion is on', () => {
    const c = src('app/api/cron/retention/route.ts');
    expect(c).toContain('.autoDelete');
    expect(c).toContain("runKycRetention('cron')");
  });
  it('consent is required, saved with its version and time, and asked on the page', () => {
    const r = src('app/api/kyc/request/route.ts');
    expect(r).toContain("code: 'consent_required'");
    expect(r).toContain('recordConsent(');
    expect(src('lib/kyc-store.ts')).toContain('KYC_CONSENT_VERSION');
    expect(src('app/kyc/page.tsx')).toContain('consent: true');
    expect(KYC_CONSENT_VERSION).toMatch(/^\d{4}-\d{2}$/);
  });
  it('the consent texts exist in all 7 languages', () => {
    for (const k of ['consent', 'consentMissing'] as const) expect(Object.keys(KYC_LABELS[k]).sort()).toEqual(['ar', 'en', 'es', 'fr', 'pt', 'ur', 'zh']);
  });
  it('the panel controls the years, auto deletion, deleting now, one person and legal hold', () => {
    const p = src('components/admin/kyc-panel.tsx');
    for (const s of ['/api/admin/kyc-retention', 'autoDelete', "action: 'run'", "action: 'purge'", "action: 'hold'"]) expect(p).toContain(s);
  });
});
