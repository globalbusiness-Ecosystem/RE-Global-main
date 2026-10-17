import { describe, it, expect } from 'vitest';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';

const ok: AttentionInput = {
  env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true },
  usdProperties: 0, piRateSet: false,
  pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 },
};

describe('buildAttention', () => {
  it('is empty when everything is fine', () => {
    expect(buildAttention(ok)).toEqual([]);
  });
  it('flags missing settings as blocking', () => {
    const ids = buildAttention({ ...ok, env: { ...ok.env, PI_API_KEY: false, PI_ISSUER_PUBLIC_KEY: false, ADMIN_SESSION_SECRET: false } }).map((x) => x.id);
    expect(ids).toEqual(['env-pi-key', 'env-signing', 'env-admin-secret']);
  });
  it('needs a Pi rate only when USD-priced properties exist', () => {
    expect(buildAttention({ ...ok, usdProperties: 2, piRateSet: false }).map((x) => x.id)).toEqual(['rate']);
    expect(buildAttention({ ...ok, usdProperties: 2, piRateSet: true })).toEqual([]);
    expect(buildAttention({ ...ok, usdProperties: 0, piRateSet: false })).toEqual([]);
  });
  it('lists review cases, then owed money last as a warning', () => {
    const items = buildAttention({ ...ok, pendingPayouts: { count: 2, amount: 10.456 }, review: { bookings: 1, holdings: 2, transfers: 3 } });
    expect(items.map((x) => x.id)).toEqual(['review-bookings', 'review-holdings', 'review-transfers', 'payouts']);
    expect(items[3].level).toBe('warn');
    expect(items[3].text).toContain('10.46 π');
    expect(items.slice(0, 3).every((x) => x.level === 'bad')).toBe(true);
  });
});

describe('share counter check', () => {
  it('warns about properties whose sold counter disagrees with confirmed purchases', () => {
    const items = buildAttention({ ...ok, shareMismatches: ['Villa A', 'Villa B', 'C', 'D'] });
    expect(items.map((x) => x.id)).toEqual(['share-mismatch']);
    expect(items[0].level).toBe('warn');
    expect(items[0].text).toContain('4 عقار');
    expect(items[0].text).toContain('...');
    expect(buildAttention({ ...ok, shareMismatches: [] })).toEqual([]);
  });
});

describe('admin two-step login check', () => {
  it('warns only when the second step is known to be missing', () => {
    expect(buildAttention({ ...ok, env: { ...ok.env, ADMIN_TOTP_SECRET: false } }).map((x) => x.id)).toEqual(['env-2fa']);
    expect(buildAttention({ ...ok, env: { ...ok.env, ADMIN_TOTP_SECRET: true } })).toEqual([]);
    expect(buildAttention(ok)).toEqual([]);
  });
});
