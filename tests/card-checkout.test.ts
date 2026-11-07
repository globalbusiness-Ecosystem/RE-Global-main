import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { planCheckout } from '@/lib/card-pay/checkout';
import { sandboxProvider } from '@/lib/card-pay/sandbox-provider';
import { signHmacSha256 } from '@/lib/card-pay/signature';
import { handleCardWebhook } from '@/lib/card-pay/webhook';
import { applyEvent, type CardOrder } from '@/lib/card-pay/order';

const SECRET = 'sandbox-secret-0123456789';
const sb = sandboxProvider(SECRET);
const find = () => sb;
const prop = { status: 'available', type: 'buy', country: 'EG', cardPrice: 1000 };

describe('planCheckout', () => {
  it('plans a card payment from the stored property', () => {
    const p = planCheckout(prop, find);
    expect(p).toMatchObject({ ok: true, quote: { currency: 'EGP', amountMinor: 100000 } });
  });
  it('refuses what cannot be paid by card', () => {
    expect(planCheckout(null, find)).toMatchObject({ ok: false, status: 404 });
    expect(planCheckout({ ...prop, hidden: true }, find)).toMatchObject({ ok: false, status: 404 });
    expect(planCheckout({ ...prop, status: 'sold' }, find)).toMatchObject({ ok: false, status: 409 });
    expect(planCheckout({ ...prop, type: 'tokenized' }, find)).toMatchObject({ ok: false, status: 400 });
    expect(planCheckout({ ...prop, cardPrice: undefined }, find)).toMatchObject({ ok: false, status: 400 });
    expect(planCheckout(prop, () => undefined)).toMatchObject({ ok: false, status: 503 });
  });
});

describe('sandbox provider', () => {
  const ev = { eventId: 'e1', orderId: 'o1', providerRef: 'sandbox_o1', status: 'paid', amountMinor: 100000, currency: 'EGP' };
  const sign = (raw: string) => ({ 'x-sandbox-signature': signHmacSha256(raw, SECRET) });
  it('sends the person back to our page with the order id', async () => {
    const s = await sb.createCheckout({ orderId: 'o 1', amountMinor: 1, currency: 'EGP', description: 'x', returnUrl: 'https://a.test/payment/card-return', customerUid: 'u' });
    expect(s.redirectUrl).toBe('https://a.test/payment/card-return?sandbox=1&order=o%201');
  });
  it('accepts only signed, well-formed notifications', () => {
    const raw = JSON.stringify(ev);
    expect(sb.parseWebhook(raw, sign(raw))).toMatchObject({ orderId: 'o1', status: 'paid' });
    expect(sb.parseWebhook(raw, {})).toBeNull();
    for (const bad of [{ ...ev, status: 'weird' }, { ...ev, amountMinor: 1.5 }, { ...ev, currency: 'XXX' }, { ...ev, eventId: 5 }]) {
      const r = JSON.stringify(bad);
      expect(sb.parseWebhook(r, sign(r))).toBeNull();
    }
    expect(sb.parseWebhook('not json', sign('not json'))).toBeNull();
  });
  it('the whole cycle: order -> signed notification -> paid, once', async () => {
    let order: CardOrder = { id: 'o1', uid: 'web_u', amountMinor: 100000, currency: 'EGP', status: 'pending', seenEvents: [] };
    let paid = 0;
    const deps = {
      getProvider: (id: string) => (id === 'sandbox' ? sb : undefined),
      applyToOrder: async (_: string, fn: (o: CardOrder) => ReturnType<typeof applyEvent>) => { const r = fn(order); if (r.ok) order = r.order; return r; },
      onPaid: async () => { paid++; },
    };
    const raw = JSON.stringify(ev);
    expect((await handleCardWebhook('sandbox', raw, sign(raw), deps)).status).toBe(200);
    expect((await handleCardWebhook('sandbox', raw, sign(raw), deps)).status).toBe(200);
    expect(order.status).toBe('paid');
    expect(paid).toBe(1);
  });
});

describe('routes', () => {
  it('checkout is signed-in only and rate limited, and tells the team when an order is paid', () => {
    expect(readFileSync('app/api/card/checkout/route.ts', 'utf8')).toContain("guardApi(req, { scope: 'card-checkout'");
    expect(readFileSync('lib/card-pay/deps.ts', 'utf8')).toContain('alertReview(');
  });
  it('the sandbox provider is only connected when its secret is set', () => {
    const s = readFileSync('lib/card-pay/registry.ts', 'utf8');
    expect(s).toContain('CARD_SANDBOX_SECRET');
    expect(s).toContain('s.length >= 16');
  });
});
