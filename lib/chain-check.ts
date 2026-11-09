import { PI_TESTNET_HORIZON } from '@/lib/chain-anchor';
import { anchorSecret, publicOf } from '@/lib/signing-keys';

export type ChainCheckCode = 'no_keys' | 'bad_secret' | 'mismatch' | 'not_found' | 'network' | 'low_balance' | 'ok';

export type ChainCheck = {
  code: ChainCheckCode;
  /** The account the platform really signs with (derived from the secret). Public, so it is safe to show and to fund. */
  publicKey?: string;
  /** Native balance in Test-π, when the account exists. */
  balance?: number;
};

/** Smallest balance that still pays for a few anchoring transactions (each costs about 0.01 with the 100000 stroop fee). */
export const MIN_ANCHOR_BALANCE = 0.1;

/** Decides what is wrong from plain facts. No network, no secrets in or out. */
export function diagnose(f: { hasSecret: boolean; derived: string | null; configuredPublic: string; status: 'ok' | 'not_found' | 'network'; balance?: number }): ChainCheck {
  if (!f.hasSecret) return { code: 'no_keys' };
  if (!f.derived) return { code: 'bad_secret' };
  const base = { publicKey: f.derived };
  if (f.configuredPublic && f.configuredPublic.trim() !== f.derived) return { code: 'mismatch', ...base };
  if (f.status === 'network') return { code: 'network', ...base };
  if (f.status === 'not_found') return { code: 'not_found', ...base };
  if ((f.balance ?? 0) < MIN_ANCHOR_BALANCE) return { code: 'low_balance', ...base, balance: f.balance ?? 0 };
  return { code: 'ok', ...base, balance: f.balance };
}

/** Looks at the platform's anchoring account on Pi Testnet. */
export async function checkPlatformAccount(): Promise<ChainCheck> {
  const secret = anchorSecret() ?? '';
  const derived = publicOf(secret);
  let status: 'ok' | 'not_found' | 'network' = 'network';
  let balance: number | undefined;
  if (derived) {
    try {
      const r = await fetch(`${PI_TESTNET_HORIZON}/accounts/${derived}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (r.status === 404) status = 'not_found';
      else if (r.ok) {
        status = 'ok';
        const native = ((await r.json().catch(() => null))?.balances ?? []).find((b: { asset_type?: string }) => b.asset_type === 'native');
        balance = Number(native?.balance ?? 0);
      }
    } catch { status = 'network'; }
  }
  return diagnose({ hasSecret: !!secret, derived, configuredPublic: '', status, balance });
}
