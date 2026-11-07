import { applyEvent, type ApplyResult, type CardOrder } from './order';
import type { CardProvider } from './provider';

export interface WebhookDeps {
  getProvider: (id: string) => CardProvider | undefined;
  /** Runs `fn` on the stored order atomically and saves its result; 'missing' when there is no such order. */
  applyToOrder: (orderId: string, fn: (o: CardOrder) => ApplyResult) => Promise<ApplyResult | 'missing'>;
  /** Called once, only when a notification really moved the order to paid. */
  onPaid?: (o: CardOrder) => Promise<void>;
  /** Called once, only when a notification really moved the order to failed (the property hold can be freed). */
  onFailed?: (o: CardOrder) => Promise<void>;
}

export interface WebhookReply { status: number; body: { ok: boolean; error?: string } }

// Handles a payment company's notification. Everything is checked before anything is changed: the provider must be
// connected, the signature must be valid (parseWebhook returns null otherwise), the order must exist, and the amount
// and currency must match what we charged. Repeats are answered 200 so the provider stops resending them.
export async function handleCardWebhook(providerId: string, rawBody: string, headers: Record<string, string | undefined>, deps: WebhookDeps): Promise<WebhookReply> {
  const provider = /^[a-z0-9-]{2,30}$/.test(providerId) ? deps.getProvider(providerId) : undefined;
  if (!provider) return { status: 404, body: { ok: false, error: 'unknown provider' } };
  let ev;
  try { ev = provider.parseWebhook(rawBody, headers); } catch { ev = null; }
  if (!ev) return { status: 400, body: { ok: false, error: 'invalid notification' } };
  let r: ApplyResult | 'missing';
  try { r = await deps.applyToOrder(ev.orderId, (o) => applyEvent(o, ev!)); } catch { return { status: 503, body: { ok: false, error: 'try again' } }; }
  if (r === 'missing') return { status: 404, body: { ok: false, error: 'unknown order' } };
  if (!r.ok) return { status: r.reason === 'mismatch' ? 400 : 409, body: { ok: false, error: r.reason } };
  if (r.changed && r.order.status === 'paid' && deps.onPaid) {
    try { await deps.onPaid(r.order); } catch { return { status: 503, body: { ok: false, error: 'try again' } }; }
  }
  if (r.changed && r.order.status === 'failed' && deps.onFailed) {
    try { await deps.onFailed(r.order); } catch { return { status: 503, body: { ok: false, error: 'try again' } }; }
  }
  return { status: 200, body: { ok: true } };
}
