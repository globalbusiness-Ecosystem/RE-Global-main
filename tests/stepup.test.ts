import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PASSKEY_TEXT, pk } from '@/lib/passkeys-i18n';
import { STEPUP_HEADER } from '@/lib/stepup-header';
import { STEPUP_HEADER as SERVER_HEADER, STEPUP_TTL_MS } from '@/lib/stepup-server';

const src = (p: string) => readFileSync(p, 'utf8');

describe('step-up confirmation: constants', () => {
  it('client and server agree on the header (case-insensitive) and the token is short-lived', () => {
    expect(STEPUP_HEADER.toLowerCase()).toBe(SERVER_HEADER);
    expect(STEPUP_TTL_MS).toBeLessThanOrEqual(5 * 60 * 1000);
  });
});

describe('step-up confirmation: text', () => {
  const keys = ['cancel', 'confirmTapHint', 'requireTitle', 'requireWarn', 'requireOnDone', 'requireOffDone', 'needDevice', 'notConfirmed'] as const;
  it('every new message exists in all 7 languages', () => {
    for (const k of keys) {
      const e = PASSKEY_TEXT[k] as Record<string, string>;
      expect(Object.keys(e).length, k).toBe(7);
      for (const v of Object.values(e)) expect(v.trim().length, k).toBeGreaterThan(0);
    }
  });
  it('falls back to English for an unknown language', () => expect(pk('cancel', 'xx')).toBe('Cancel'));
});

describe('step-up confirmation: wiring', () => {
  it.each(['app/api/payments/approve/route.ts', 'app/api/card/checkout/route.ts', 'app/api/my-data/route.ts'])('%s is gated', (f) => {
    expect(src(f)).toMatch(/stepUpGate\(/);
  });
  it('erasing data also wipes the stored settings and tokens', () => expect(src('app/api/my-data/route.ts')).toMatch(/eraseStepUpData\(/));
  it('the provider is mounted for the whole app', () => expect(src('components/app-wrapper.tsx')).toMatch(/<StepUpProvider>/));
  it('payment asks before the Pi sheet and forwards the token on approval', () => {
    const s = src('components/unified-payment-button.tsx');
    expect(s.indexOf('ensureStepUp()')).toBeGreaterThan(-1);
    expect(s.indexOf('ensureStepUp()')).toBeLessThan(s.indexOf('window.Pi.createPayment('));
    expect(s).toMatch(/STEPUP_HEADER/);
  });
  it('card checkout and erase retry through stepUpFetch', () => {
    expect(src('components/card-pay-button.tsx')).toMatch(/stepUpFetch\('\/api\/card\/checkout'/);
    expect(src('components/my-data-panel.tsx')).toMatch(/stepUpFetch\('\/api\/my-data'/);
  });
  it('changing the setting needs a fresh fingerprint on the server too', () => {
    const s = src('app/api/passkeys/prefs/route.ts');
    expect(s).toMatch(/consumeStepUp\(/);
    expect(s).toMatch(/stepup_required/);
  });
  it('tokens are stored hashed and deleted on use', () => {
    const s = src('lib/stepup-server.ts');
    expect(s).toMatch(/createHash\('sha256'\)/);
    expect(s).toMatch(/\.delete\(/);
  });
});
