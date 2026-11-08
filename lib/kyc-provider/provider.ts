// A company that checks identity documents for us (Sumsub, Veriff...). Every company gets one adapter that fits this
// shape, so nothing else changes when one is added. With no company configured the team reviews by hand (the default).

export interface KycStartInput { uid: string; legalName: string; country: string; docType: string; returnUrl: string }

export interface KycProvider {
  id: string;
  /** Opens a check at the company; the person is sent to `url` to take photos there. `uid` is the company's external user id. */
  start(input: KycStartInput): Promise<{ url: string }>;
  /** Checks the company's signature on a callback and says what it decided; null when the call is not genuine. */
  parseWebhook(raw: string, headers: Record<string, string | undefined>): { uid: string; decision: 'approved' | 'rejected'; reason?: string } | null;
}

const providers = new Map<string, KycProvider>();
export const registerKycProvider = (p: KycProvider): void => { providers.set(p.id, p); };
export const getKycProvider = (id: string): KycProvider | null => providers.get(id) ?? null;
export const clearKycProviders = (): void => providers.clear();

/** The company chosen with KYC_PROVIDER, or null (manual review) when none is set or it is not connected. */
export function activeKycProvider(envValue: string | undefined = process.env.KYC_PROVIDER): KycProvider | null {
  const id = (envValue ?? '').trim().toLowerCase();
  if (!id || id === 'manual') return null;
  return getKycProvider(id);
}
