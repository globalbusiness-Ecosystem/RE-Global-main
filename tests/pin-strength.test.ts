import { describe, it, expect } from 'vitest';
import { isStrongPin } from '@/lib/pin-strength';
import { buildAttention, type AttentionInput } from '@/lib/attention-rules';

describe('isStrongPin', () => {
  it('rejects short and digit-only PINs', () => {
    for (const p of ['1234', '123456', '12345678', 'abcdefg', '', '   ']) expect(isStrongPin(p)).toBe(false);
  });
  it('rejects repeated characters however long', () => {
    expect(isStrongPin('aaaaaaaaaaaa')).toBe(false);
    expect(isStrongPin('1212121212')).toBe(false);
  });
  it('accepts long PINs and 8+ mixes of letters and digits', () => {
    expect(isStrongPin('K7mq29xv')).toBe(true);
    expect(isStrongPin('4829173650')).toBe(true);
  });
  it('treats a missing PIN as not strong', () => {
    expect(isStrongPin(undefined)).toBe(false);
    expect(isStrongPin(null)).toBe(false);
  });
});

describe('weak admin PIN reminder', () => {
  const ok: AttentionInput = {
    env: { PI_API_KEY: true, PI_ISSUER_SECRET_KEY: true, PI_ISSUER_PUBLIC_KEY: true, ADMIN_SESSION_SECRET: true },
    usdProperties: 0, piRateSet: false,
    pendingPayouts: { count: 0, amount: 0 }, review: { bookings: 0, holdings: 0, transfers: 0 },
  };
  it('warns only when the PIN is known to be weak', () => {
    expect(buildAttention({ ...ok, env: { ...ok.env, ADMIN_PIN_STRONG: false } }).map((x) => x.id)).toEqual(['env-pin']);
    expect(buildAttention({ ...ok, env: { ...ok.env, ADMIN_PIN_STRONG: true } })).toEqual([]);
    expect(buildAttention(ok)).toEqual([]);
  });
});
