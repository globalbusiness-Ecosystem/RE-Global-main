import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildReadiness, readinessSummary, GROUP_LABELS, type ReadinessInput } from '@/lib/launch-readiness';

const good: ReadinessInput = {
  env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true, ADMIN_TOTP_SECRET: true, ADMIN_PIN_STRONG: true, ADMIN_ALERT_EMAIL: true, CRON_SECRET: true, EMAIL_CONFIGURED: true, FIREBASE_WEB_CONFIG: true, CUSTOM_DOMAIN: true, REGISTRY_CONTRACT_ID: true },
  cardSandboxOn: false, realCardProvider: true, kycByCompany: false,
  visibleProperties: 3, incompleteListings: 0, usdProperties: 0, piRateSet: false, reviewCases: 0, shareMismatches: 0, kycPending: 0, kycOldestHours: 0,
};
const failed = (i: ReadinessInput) => buildReadiness(i).filter((c) => !c.ok).map((c) => c.id);

describe('launch readiness', () => {
  it('is ready when everything is set', () => {
    expect(failed(good)).toEqual([]);
    expect(readinessSummary(buildReadiness(good))).toMatchObject({ ready: true, blocking: 0, advice: 0 });
  });
  it('the test card provider left on blocks the launch', () => {
    const c = buildReadiness({ ...good, cardSandboxOn: true }).find((x) => x.id === 'sandbox-off');
    expect(c?.ok).toBe(false);
    expect(c?.blocking).toBe(true);
  });
  it('no real card company is only a recommendation, a weak admin PIN blocks', () => {
    const s = readinessSummary(buildReadiness({ ...good, realCardProvider: false, env: { ...good.env, ADMIN_PIN_STRONG: false } }));
    expect(s).toMatchObject({ ready: false, blocking: 1, advice: 1 });
  });
  it('needs a Pi rate only with USD-priced listings; a late identity queue blocks', () => {
    expect(failed({ ...good, usdProperties: 2, piRateSet: false })).toEqual(['pi-rate']);
    expect(failed({ ...good, usdProperties: 2, piRateSet: true })).toEqual([]);
    expect(failed({ ...good, kycPending: 3, kycOldestHours: 60 })).toEqual(['kyc-queue']);
    expect(failed({ ...good, kycPending: 3, kycOldestHours: 6 })).toEqual([]);
  });
  it('every check belongs to a known group and tells what to do', () => {
    for (const c of buildReadiness(good)) {
      expect(Object.keys(GROUP_LABELS)).toContain(c.group);
      expect(c.fix.length).toBeGreaterThan(10);
    }
  });
  it('wiring: admin only, flags only, shown on the dashboard', () => {
    expect(readFileSync('app/api/admin/readiness/route.ts', 'utf8')).toContain('isAdminRequest');
    expect(readFileSync('components/admin/dashboard-tab.tsx', 'utf8')).toContain('<ReadinessPanel');
    // Only the checks and the summary are returned, built from yes/no flags.
    expect(readFileSync('lib/admin-readiness.ts', 'utf8')).toContain('return { checks, summary: readinessSummary(checks) }');
  });
});
