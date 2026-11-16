import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PASSKEY_TEXT } from '@/lib/passkeys-i18n';

const src = (p: string) => readFileSync(p, 'utf8');

describe('fingerprint lock', () => {
  it('the new texts exist in all 7 languages', () => {
    for (const k of ['lockTitle', 'lockBody', 'lastProtected', 'lockHelp', 'requireTitle', 'requireWarn'] as const) {
      const e = PASSKEY_TEXT[k] as Record<string, string>;
      expect(Object.keys(e), k).toHaveLength(7);
      for (const v of Object.values(e)) expect(v.trim().length, k).toBeGreaterThan(0);
    }
  });
  it('the device prompt opens by itself, in the confirm window and on the lock screen', () => {
    const s = src('components/stepup-provider.tsx');
    expect(s).toMatch(/autoModal\.current = true; void scanNow\(\)/);
    expect(s).toMatch(/autoLock\.current = true; void unlock\(\)/);
  });
  it('the lock covers the app, re-locks after a minute away, and only on devices that can answer', () => {
    const s = src('components/stepup-provider.tsx');
    expect(s).toMatch(/z-\[120\]/);
    expect(s).toMatch(/RELOCK_AFTER_MS = 60_000/);
    expect(s).toMatch(/passkeysAvailable\(\)/);
  });
  it('removing a fingerprint while the lock is on needs a fresh one, and the last one stays', () => {
    const r = src('app/api/passkeys/route.ts');
    expect(r).toMatch(/last_protected/);
    expect(r).toMatch(/stepUpGate\(/);
    expect(r.indexOf('last_protected')).toBeLessThan(r.indexOf('stepUpGate('));
    expect(src('components/passkey-settings.tsx')).toMatch(/lastProtected/);
  });
  it('the admin can reset a person who lost their device, and it is audited', () => {
    const r = src('app/api/admin/passkey-reset/route.ts');
    expect(r).toMatch(/isAdminRequest/);
    expect(r).toMatch(/logAdmin\('user\.passkeys\.reset'/);
    expect(r).toMatch(/eraseStepUpData\(uid\)/);
  });
});
