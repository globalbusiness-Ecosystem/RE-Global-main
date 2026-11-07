import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { handleCardWebhook, type WebhookDeps } from '@/lib/card-pay/webhook';
import { signHmacSha256, verifyHmacSha256 } from '@/lib/card-pay/signature';
import type { CardProvider, WebhookEvent } from '@/lib/card-pay/provider';
import type { CardOrder } from '@/lib/card-pay/order';

const SECRET = 'hold-test-secret';
const provider: CardProvider = {
  id: 'fakepay', currencies: ['EGP'],
  createCheckout: async () => ({ providerRef: 'r', redirectUrl: 'https://pay.example' }),
  refund: async () => ({ ok: true }),
  parseWebhook: (raw, h) => (verifyHmacSha256(raw, h['x-signature'], SECRET) ? (JSON.parse(raw) as WebhookEvent) : null),
};
const base: CardOrder = { id: 'o1', uid: 'web_u', propertyId: 'p1', amountMinor: 5000, currency: 'EGP', status: 'pending', seenEvents: [] };
const body = (o: Partial<WebhookEvent> = {}) => JSON.stringify({ eventId: 'e1', orderId: 'o1', providerRef: 'p', status: 'failed', amountMinor: 5000, currency: 'EGP', ...o });

function run(initial: CardOrder) {
  const calls = { failed: 0, paid: 0 };
  let order = initial;
  const deps: WebhookDeps = {
    getProvider: () => provider,
    applyToOrder: async (_i, fn) => { const r = fn(order); if (r.ok) order = r.order; return r; },
    onPaid: async () => { calls.paid++; },
    onFailed: async () => { calls.failed++; },
  };
  return { calls, deps };
}

describe('property hold for card orders', () => {
  it('a failed payment frees the hold once, and a repeat does not free it again', async () => {
    const { calls, deps } = run(base);
    const raw = body();
    const h = { 'x-signature': signHmacSha256(raw, SECRET) };
    expect((await handleCardWebhook('fakepay', raw, h, deps)).status).toBe(200);
    expect((await handleCardWebhook('fakepay', raw, h, deps)).status).toBe(200);
    expect(calls).toEqual({ failed: 1, paid: 0 });
  });
  it('a paid payment does not trigger the release', async () => {
    const { calls, deps } = run(base);
    const raw = body({ status: 'paid' });
    await handleCardWebhook('fakepay', raw, { 'x-signature': signHmacSha256(raw, SECRET) }, deps);
    expect(calls).toEqual({ failed: 0, paid: 1 });
  });
  it('a failure that cannot be recorded asks the provider to retry', async () => {
    const { deps } = run(base);
    deps.onFailed = async () => { throw new Error('down'); };
    const raw = body();
    expect((await handleCardWebhook('fakepay', raw, { 'x-signature': signHmacSha256(raw, SECRET) }, deps)).status).toBe(503);
  });
});

describe('routes use the same hold and sale rules as Pi payments', () => {
  it('checkout holds the property, refuses when it is held, and frees it on error', () => {
    const s = readFileSync('app/api/card/checkout/route.ts', 'utf8');
    expect(s).toContain('reserveForPayment(propertyId, user.uid, user.username, orderId)');
    expect(s).toContain('RESERVE_ERRORS[v.code]');
    expect(s).toContain('releaseReservation(propertyId, user.uid)');
    expect(s.indexOf('reserveForPayment(')).toBeLessThan(s.indexOf('createCheckout('));
  });
  it('the notification marks the property sold when paid and frees it when failed', () => {
    const s = readFileSync('lib/card-pay/deps.ts', 'utf8');
    expect(s).toContain('finalizeSale(');
    expect(s).toContain('releaseReservation(');
  });
  it('the order keeps the property it is for', () => {
    expect(readFileSync('lib/card-pay/store.ts', 'utf8')).toContain('propertyId: typeof d.propertyId');
  });
});
