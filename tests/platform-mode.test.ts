import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { MODES, MODE_AR, parseMode, platformMode, realMoneyAllowed, distributionsAllowed } from '@/lib/platform-mode';
import { buildReadiness, type ReadinessInput } from '@/lib/launch-readiness';

const read = (p: string) => readFileSync(p, 'utf8');

describe('parseMode', () => {
  it('accepts the three modes in any case and with - or space instead of _', () => {
    expect(parseMode('LIVE')).toBe('LIVE');
    expect(parseMode(' live ')).toBe('LIVE');
    expect(parseMode('soft-launch')).toBe('SOFT_LAUNCH');
    expect(parseMode('Soft Launch')).toBe('SOFT_LAUNCH');
    expect(parseMode('sandbox')).toBe('SANDBOX');
  });
  it('anything else is SANDBOX, the safe mode', () => {
    for (const v of [undefined, null, '', 'prod', 'production', 'LIVE!', 'LIV', 1, true, {}]) expect(parseMode(v), String(v)).toBe('SANDBOX');
  });
  it('platformMode reads PLATFORM_MODE and defaults to SANDBOX', () => {
    delete process.env.PLATFORM_MODE;
    expect(platformMode()).toBe('SANDBOX');
    process.env.PLATFORM_MODE = 'LIVE';
    expect(platformMode()).toBe('LIVE');
    process.env.PLATFORM_MODE = 'oops';
    expect(platformMode()).toBe('SANDBOX');
  });
  afterEach(() => { delete process.env.PLATFORM_MODE; });
});

describe('what a mode allows', () => {
  it('real money is never allowed in SANDBOX', () => {
    expect(realMoneyAllowed('SANDBOX')).toBe(false);
    expect(realMoneyAllowed('SOFT_LAUNCH')).toBe(true);
    expect(realMoneyAllowed('LIVE')).toBe(true);
  });
  it('a distribution needs both a real-money mode and the exact switch', () => {
    for (const m of MODES) {
      expect(distributionsAllowed(m, undefined), m).toBe(false);
      expect(distributionsAllowed(m, '0'), m).toBe(false);
      expect(distributionsAllowed(m, 'true'), m).toBe(false);
    }
    expect(distributionsAllowed('SANDBOX', '1')).toBe(false);
    expect(distributionsAllowed('SOFT_LAUNCH', '1')).toBe(true);
    expect(distributionsAllowed('LIVE', '1')).toBe(true);
  });
  it('every mode has an Arabic label', () => {
    for (const m of MODES) expect(MODE_AR[m].length).toBeGreaterThan(5);
  });
});

describe('where the mode is used', () => {
  const input = (mode: ReadinessInput['platformMode']): ReadinessInput => ({
    env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true, ADMIN_TOTP_SECRET: true, ADMIN_PIN_STRONG: true, ADMIN_ALERT_EMAIL: true, CRON_SECRET: true, EMAIL_CONFIGURED: true, FIREBASE_WEB_CONFIG: true, CUSTOM_DOMAIN: true, REGISTRY_CONTRACT_ID: true },
    cardSandboxOn: false, platformMode: mode, realCardProvider: true, kycByCompany: false,
    visibleProperties: 3, incompleteListings: 0, usdProperties: 0, piRateSet: false, reviewCases: 0, shareMismatches: 0, kycPending: 0, kycOldestHours: 0,
  });
  it('the readiness list shows the mode but never blocks the launch because of it', () => {
    for (const m of MODES) {
      const c = buildReadiness(input(m)).find((x) => x.id === 'platform-mode');
      expect(c?.ok, m).toBe(true);
      expect(c?.blocking, m).toBe(false);
      expect(c?.title).toContain(m);
    }
  });
  it('the distribution lock goes through the mode, and the mode reads only the environment', () => {
    expect(read('lib/distribution-server.ts')).toContain('distributionsAllowed(platformMode(), process.env.DISTRIBUTIONS_ENABLED)');
    expect(read('lib/admin-readiness.ts')).toContain('platformMode: platformMode()');
    const m = read('lib/platform-mode.ts');
    expect(m).not.toMatch(/from '|require\(/);
    expect(m.match(/process\.env\.[A-Z_]+/g)).toEqual(['process.env.PLATFORM_MODE']);
  });
});
