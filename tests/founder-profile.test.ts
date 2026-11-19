import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FOUNDER_NAME_COOLDOWN_MS, NAME_COOLDOWN_MS, cooldownLeftMs, nameCooldownMs } from '@/lib/display-name';

const src = (p: string) => readFileSync(p, 'utf8');

describe('founder name cooldown', () => {
  it('is 24 hours for the founder and 7 days for everyone else', () => {
    expect(FOUNDER_NAME_COOLDOWN_MS).toBe(24 * 3600 * 1000);
    expect(nameCooldownMs(true)).toBe(FOUNDER_NAME_COOLDOWN_MS);
    expect(nameCooldownMs(false)).toBe(NAME_COOLDOWN_MS);
  });
  it('lets the founder change again after a day but not a normal user', () => {
    const now = 10 * 86_400_000;
    const changed = now - 2 * 3600 * 1000 - 24 * 3600 * 1000;
    expect(cooldownLeftMs(changed, now, FOUNDER_NAME_COOLDOWN_MS)).toBe(0);
    expect(cooldownLeftMs(changed, now)).toBeGreaterThan(0);
  });
  it('the store applies the founder window', () => {
    expect(src('lib/display-name-store.ts')).toContain('nameCooldownMs(isFounder)');
  });
});

describe('founder profile look', () => {
  it('settings page shows the aura only for the founder', () => {
    const s = src('components/pages/settings-page.tsx');
    expect(s).toContain('{isFounder && <FounderRing />}');
    expect(s).toContain('{isFounder && <FounderCoverSheen />}');
    expect(s).toContain('isFounder={isFounder}');
  });
  it('the ring respects reduced motion and is hidden from screen readers', () => {
    const s = src('components/founder-aura.tsx');
    expect(s).toContain('prefers-reduced-motion');
    expect(s).toContain('aria-hidden');
  });
});
