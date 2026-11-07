// Card payments are provider-agnostic: every payment company (Paymob, Kashier, Stripe, Checkout.com, Telr…) is an
// adapter with the same small interface, so the rest of the platform never depends on one of them.
// The customer pays on the provider's own hosted page, so card numbers never touch our servers.

// Two-decimal currencies only (KWD and JOD use three, so they are left out until a provider needs them).
export type Currency = 'EGP' | 'AED' | 'SAR' | 'QAR' | 'TRY' | 'GBP' | 'USD' | 'CAD' | 'EUR' | 'AUD';
export const CURRENCIES: readonly Currency[] = ['EGP', 'AED', 'SAR', 'QAR', 'TRY', 'GBP', 'USD', 'CAD', 'EUR', 'AUD'];

export interface CheckoutRequest {
  orderId: string;
  /** Minor units (piasters, fils, cents) — never floating point. */
  amountMinor: number;
  currency: Currency;
  description: string;
  returnUrl: string;
  customerUid: string;
}

export interface CheckoutSession {
  providerRef: string;
  redirectUrl: string;
}

export interface WebhookEvent {
  /** Provider's own unique id of this notification, used to ignore repeats. */
  eventId: string;
  orderId: string;
  providerRef: string;
  status: 'paid' | 'failed' | 'refunded';
  amountMinor: number;
  currency: Currency;
}

export interface CardProvider {
  readonly id: string;
  /** Currencies this provider's merchant account can take. */
  readonly currencies: readonly Currency[];
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Returns null when the signature is wrong or the body is not a valid notification. */
  parseWebhook(rawBody: string, headers: Record<string, string | undefined>): WebhookEvent | null;
  refund(providerRef: string, amountMinor: number): Promise<{ ok: boolean }>;
}

const registry = new Map<string, CardProvider>();
export function registerProvider(p: CardProvider): void {
  if (!/^[a-z0-9-]{2,30}$/.test(p.id)) throw new Error('bad provider id');
  registry.set(p.id, p);
}
export const getProvider = (id: string): CardProvider | undefined => registry.get(id);
export const listProviders = (): CardProvider[] => [...registry.values()];
export function _clearProviders(): void { registry.clear(); }

/** The first provider that can take this currency, or undefined when none is connected. */
export function providerFor(currency: Currency): CardProvider | undefined {
  return listProviders().find((p) => p.currencies.includes(currency));
}
