import { PI_TESTNET_HORIZON } from '@/lib/chain-anchor';
import { anchorSecret, publicOf } from '@/lib/signing-keys';
import { readRegistryAdmin, registryVerdict, type RegistryState } from '@/lib/registry-client';

export type ChainCheckCode = 'no_keys' | 'bad_secret' | 'mismatch' | 'not_found' | 'network' | 'low_balance' | 'ok';

export type ChainCheck = {
  code: ChainCheckCode;
  /** The account the platform really signs with (derived from the secret). Public, so it is safe to show and to fund. */
  publicKey?: string;
  /** Native balance in Test-π, when the account exists. */
  balance?: number;
  /** The ownership registry (smart contract): is it configured, deployed, and is the anchoring account its admin? Only checked when the account itself is fine. */
  registry?: RegistryState;
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
  const out = diagnose({ hasSecret: !!secret, derived, configuredPublic: '', status, balance });
  if (out.code === 'ok' && derived) {
    const id = (process.env.REGISTRY_CONTRACT_ID ?? '').trim();
    const read = id ? await readRegistryAdmin(id, derived) : { reach: 'ok' as const };
    out.registry = registryVerdict({ configured: !!id, reach: read.reach, admin: 'admin' in read ? read.admin : undefined, expectedAdmin: derived });
  }
  return out;
}
