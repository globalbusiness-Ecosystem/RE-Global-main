import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';

const base: AttentionInput = {
  env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true },
  usdProperties: 0, piRateSet: true, pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 },
};

describe('platform blockchain account alerts', () => {
  it('says nothing when the account is fine', () => {
    expect(buildAttention(base).some((i) => i.id === 'chain-account')).toBe(false);
  });
  it('a low balance is a warning, a missing or wrong account is urgent', () => {
    expect(buildAttention({ ...base, chainAccount: 'low_balance' }).find((i) => i.id === 'chain-account')?.level).toBe('warn');
    for (const c of ['not_found', 'mismatch', 'bad_secret'] as const) expect(buildAttention({ ...base, chainAccount: c }).find((i) => i.id === 'chain-account')?.level).toBe('bad');
  });
  it('the dashboard flags only real problems, never a network hiccup, and never shows a secret', () => {
    const s = readFileSync('lib/admin-attention.ts', 'utf8');
    expect(s).toContain('checkPlatformAccount');
    expect(s).toMatch(/chainCode === 'low_balance'/);
    expect(s).not.toMatch(/chainAccount[^\n]*process\.env/);
  });
});
