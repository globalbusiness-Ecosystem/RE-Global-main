import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { linkedLevel, maxLevel } from '@/lib/verification-level';

const src = (p: string) => readFileSync(p, 'utf8');

describe('verification of linked accounts', () => {
  it('an approved identity check is full, a Pi sign-in alone is the Pi level, nothing is none', () => {
    expect(linkedLevel({ pi: true, kyc: true })).toBe('full');
    expect(linkedLevel({ pi: false, kyc: true })).toBe('full');
    expect(linkedLevel({ pi: true, kyc: false })).toBe('pi');
    expect(linkedLevel({ pi: false, kyc: false })).toBe('none');
    expect(linkedLevel(null)).toBe('none');
  });
  it('the person is as verified as the best account', () => {
    expect(maxLevel('none', 'pi')).toBe('pi');
    expect(maxLevel('full', 'pi')).toBe('full');
    expect(maxLevel('pi', 'pi')).toBe('pi');
  });
  it('the server remembers a Pi sign-in only for Pi accounts it just authenticated, at most every 12 hours', () => {
    const s = src('lib/pi-verified.ts');
    expect(s).toContain("accountKind(uid) !== 'pi'");
    expect(s).toContain('REFRESH_MS');
    for (const f of ['app/api/identity/route.ts', 'app/api/identity/link/route.ts', 'app/api/identity/link-code/route.ts']) {
      const r = src(f);
      expect(r).toContain('guardApi');
      expect(r).toContain('markPiVerified');
    }
  });
  it('the settings page uses the combined level', () => {
    const s = src('components/pages/settings-page.tsx');
    expect(s).toContain('maxLevel(ownLevel, linkedVerifyLevel)');
  });
  it('payments still need the identity check of the web account itself', () => {
    expect(src('lib/kyc-rules.ts')).toContain("uid.startsWith('web_')");
  });
});
