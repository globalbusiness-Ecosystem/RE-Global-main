import 'server-only';
import { registerProvider, getProvider } from './provider';
import { sandboxProvider } from './sandbox-provider';

// Connects the payment companies whose secrets are set in the environment. Real companies get added here
// (one adapter each) once a merchant account exists. The test provider is on only while CARD_SANDBOX_SECRET is set.
export function ensureProviders(): void {
  const s = process.env.CARD_SANDBOX_SECRET;
  if (s && s.length >= 16 && !getProvider('sandbox')) registerProvider(sandboxProvider(s));
}
