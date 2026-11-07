import { describe, it, expect, beforeEach } from 'vitest';
import { registerProvider, getProvider, providerFor, listProviders, _clearProviders, type CardProvider } from '@/lib/card-pay/provider';
import { verifyHmacSha256, signHmacSha256 } from '@/lib/card-pay/signature';
import { applyEvent, canMove, toMinor, type CardOrder } from '@/lib/card-pay/order';

const fake = (id: string, currencies: CardProvider['currencies']): CardProvider => ({
  id, currencies,
  createCheckout: async () => ({ providerRef: 'r', redirectUrl: 'https://pay.example/x' }),
  parseWebhook: () => null,
  refund: async () => ({ ok: true }),
});

describe('provider registry', () => {
  beforeEach(() => _clearProviders());
  it('picks a provider by currency and returns nothing when none is connected', () => {
    expect(providerFor('EGP')).toBeUndefined();
    registerProvider(fake('egy', ['EGP']));
    registerProvider(fake('uae', ['AED', 'USD']));
    expect(providerFor('EGP')?.id).toBe('egy');
    expect(providerFor('USD')?.id).toBe('uae');
    expect(providerFor('EUR')).toBeUndefined();
    expect(getProvider('uae')).toBeDefined();
    expect(listProviders()).toHaveLength(2);
  });
  it('refuses odd provider ids', () => {
    expect(() => registerProvider(fake('Bad Id!', ['EGP']))).toThrow();
  });
});

describe('webhook signature', () => {
  const secret = 'test-secret-not-real';
  it('accepts the right signature and nothing else', () => {
    const body = '{"a":1}';
    const sig = signHmacSha256(body, secret);
    expect(verifyHmacSha256(body, sig, secret)).toBe(true);
    expect(verifyHmacSha256(body + ' ', sig, secret)).toBe(false);
    expect(verifyHmacSha256(body, sig, 'other')).toBe(false);
    expect(verifyHmacSha256(body, undefined, secret)).toBe(false);
    expect(verifyHmacSha256(body, 'zz', secret)).toBe(false);
    expect(verifyHmacSha256(body, sig, '')).toBe(false);
  });
});

describe('money', () => {
  it('converts to whole minor units and refuses bad amounts', () => {
    expect(toMinor(12.5)).toBe(1250);
    expect(toMinor(0.1)).toBe(10);
    for (const bad of [0, -1, NaN, Infinity, 1.005, 1e12]) expect(toMinor(bad)).toBeNull();
  });
});

describe('order state', () => {
  const base: CardOrder = { id: 'o1', uid: 'web_u', amountMinor: 1000, currency: 'EGP', status: 'pending', seenEvents: [] };
  const ev = (o: Partial<Parameters<typeof applyEvent>[1]> = {}) => ({ eventId: 'e1', orderId: 'o1', providerRef: 'p1', status: 'paid' as const, amountMinor: 1000, currency: 'EGP' as const, ...o });

  it('marks an order paid once, and a repeated notification changes nothing', () => {
    const a = applyEvent(base, ev());
    expect(a).toMatchObject({ ok: true, changed: true });
    if (!a.ok) return;
    const b = applyEvent(a.order, ev());
    expect(b).toMatchObject({ ok: true, changed: false });
    const c = applyEvent(a.order, ev({ eventId: 'e2' }));
    expect(c).toMatchObject({ ok: true, changed: false });
  });
  it('refuses a different amount, currency or order', () => {
    for (const o of [{ amountMinor: 1 }, { currency: 'USD' as const }, { orderId: 'o2' }]) {
      expect(applyEvent(base, ev(o))).toEqual({ ok: false, reason: 'mismatch' });
    }
  });
  it('only moves forward', () => {
    expect(canMove('pending', 'paid')).toBe(true);
    expect(canMove('failed', 'paid')).toBe(true);
    expect(canMove('paid', 'pending' as never)).toBe(false);
    expect(canMove('refunded', 'paid')).toBe(false);
    expect(applyEvent(base, ev({ status: 'refunded' }))).toEqual({ ok: false, reason: 'transition' });
    const paid = { ...base, status: 'paid' as const };
    expect(applyEvent(paid, ev({ eventId: 'e9', status: 'failed' }))).toEqual({ ok: false, reason: 'transition' });
    expect(applyEvent(paid, ev({ eventId: 'e9', status: 'refunded' }))).toMatchObject({ ok: true, changed: true });
  });
});
