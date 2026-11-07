import type { CardProvider, WebhookEvent } from './provider';
import { CURRENCIES } from './provider';
import { verifyHmacSha256 } from './signature';

// A pretend payment company for testing the whole card flow without money. It "takes" every currency and trusts
// notifications signed with a shared secret. It only exists while CARD_SANDBOX_SECRET is set (see registry.ts).
export function sandboxProvider(secret: string): CardProvider {
  return {
    id: 'sandbox',
    currencies: CURRENCIES,
    async createCheckout(req) {
      const sep = req.returnUrl.includes('?') ? '&' : '?';
      return { providerRef: `sandbox_${req.orderId}`, redirectUrl: `${req.returnUrl}${sep}sandbox=1&order=${encodeURIComponent(req.orderId)}` };
    },
    parseWebhook(rawBody, headers) {
      if (!verifyHmacSha256(rawBody, headers['x-sandbox-signature'], secret)) return null;
      let j: Partial<WebhookEvent> | null;
      try { j = JSON.parse(rawBody); } catch { return null; }
      if (!j || typeof j.eventId !== 'string' || typeof j.orderId !== 'string' || typeof j.providerRef !== 'string') return null;
      if (j.status !== 'paid' && j.status !== 'failed' && j.status !== 'refunded') return null;
      if (typeof j.amountMinor !== 'number' || !Number.isInteger(j.amountMinor) || !(CURRENCIES as readonly string[]).includes(String(j.currency))) return null;
      return j as WebhookEvent;
    },
    async refund() { return { ok: true }; },
  };
}
