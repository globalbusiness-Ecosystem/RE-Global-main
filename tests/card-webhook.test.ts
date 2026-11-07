import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { handleCardWebhook, type WebhookDeps } from '@/lib/card-pay/webhook';
import { signHmacSha256, verifyHmacSha256 } from '@/lib/card-pay/signature';
import type { CardProvider, WebhookEvent } from '@/lib/card-pay/provider';
import type { CardOrder } from '@/lib/card-pay/order';

const SECRET = 'unit-test-secret';
const provider: CardProvider = {
  id: 'fakepay', currencies: ['EGP'],
  createCheckout: async () => ({ providerRef: 'r', redirectUrl: 'https://pay.example' }),
  refund: async () => ({ ok: true }),
  parseWebhook: (raw, h) => {
    if (!verifyHmacSha256(raw, h['x-signature'], SECRET)) return null;
    try { return JSON.parse(raw) as WebhookEvent; } catch { return null; }
  },
};

function setup(order?: CardOrder) {
  const state = { order, paid: 0 };
  const deps: WebhookDeps = {
    getProvider: (id) => (id === 'fakepay' ? provider : undefined),
    applyToOrder: async (_id, fn) => {
      if (!state.order) return 'missing';
      const r = fn(state.order);
      if (r.ok) state.order = r.order;
      return r;
    },
    onPaid: async () => { state.paid++; },
  };
  return { state, deps };
}
const base: CardOrder = { id: 'o1', uid: 'web_u', amountMinor: 5000, currency: 'EGP', status: 'pending', seenEvents: [] };
const evBody = (o: Partial<WebhookEvent> = {}) => JSON.stringify({ eventId: 'e1', orderId: 'o1', providerRef: 'p1', status: 'paid', amountMinor: 5000, currency: 'EGP', ...o });
const signed = (raw: string) => ({ 'x-signature': signHmacSha256(raw, SECRET) });

describe('card webhook', () => {
  it('a signed, matching notification marks the order paid once, and a repeat is answered 200 without paying twice', async () => {
    const { state, deps } = setup(base);
    const raw = evBody();
    expect(await handleCardWebhook('fakepay', raw, signed(raw), deps)).toEqual({ status: 200, body: { ok: true } });
    expect(state.order?.status).toBe('paid');
    expect(await handleCardWebhook('fakepay', raw, signed(raw), deps)).toEqual({ status: 200, body: { ok: true } });
    expect(state.paid).toBe(1);
  });
  it('rejects a wrong signature and changes nothing', async () => {
    const { state, deps } = setup(base);
    const r = await handleCardWebhook('fakepay', evBody(), { 'x-signature': 'f'.repeat(64) }, deps);
    expect(r.status).toBe(400);
    expect(state.order?.status).toBe('pending');
  });
  it('rejects a different amount (400) and leaves the order alone', async () => {
    const { state, deps } = setup(base);
    const raw = evBody({ amountMinor: 1 });
    expect((await handleCardWebhook('fakepay', raw, signed(raw), deps)).status).toBe(400);
    expect(state.order?.status).toBe('pending');
    expect(state.paid).toBe(0);
  });
  it('unknown provider, odd provider id and unknown order are 404', async () => {
    const { deps } = setup(base);
    expect((await handleCardWebhook('nope', '{}', {}, deps)).status).toBe(404);
    expect((await handleCardWebhook('../x', '{}', {}, deps)).status).toBe(404);
    const none = setup(undefined);
    const raw = evBody();
    expect((await handleCardWebhook('fakepay', raw, signed(raw), none.deps)).status).toBe(404);
  });
  it('an impossible move (paid order told it failed) is 409', async () => {
    const { deps } = setup({ ...base, status: 'paid' });
    const raw = evBody({ eventId: 'e2', status: 'failed' });
    expect((await handleCardWebhook('fakepay', raw, signed(raw), deps)).status).toBe(409);
  });
  it('a storage failure asks the provider to retry (503)', async () => {
    const { deps } = setup(base);
    deps.applyToOrder = async () => { throw new Error('down'); };
    const raw = evBody();
    expect((await handleCardWebhook('fakepay', raw, signed(raw), deps)).status).toBe(503);
  });
  it('the route is rate limited by IP and wired to the real store', () => {
    const s = readFileSync('app/api/card/webhook/[provider]/route.ts', 'utf8');
    expect(s).toContain('ipLimited(');
    expect(s).toContain('cardWebhookDeps');
    expect(readFileSync('lib/card-pay/deps.ts', 'utf8')).toContain('applyToOrder');
  });
});
