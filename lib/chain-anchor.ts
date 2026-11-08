import { Account, Asset, Keypair, Memo, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

// Puts a contract's fingerprint (its SHA-256) on the Pi Testnet blockchain: one tiny transaction from the platform
// account to itself that carries the fingerprint as its memo. Anyone can later look the transaction up and see the
// same fingerprint, which proves the contract existed unchanged at that moment. Used for card payments, where the
// payment itself is not on the blockchain (a Pi payment already is).

export const PI_TESTNET_HORIZON = 'https://api.testnet.minepi.com';
export const PI_TESTNET_PASSPHRASE = 'Pi Testnet';
const HASH_RE = /^[0-9a-f]{64}$/;

/** Builds and signs the anchoring transaction. Pure: no network. `sequence` is the account's current sequence number. */
export function buildAnchorTx(secretKey: string, sequence: string, hashHex: string, fee = '100000'): { xdr: string; txid: string } | null {
  if (!HASH_RE.test(hashHex)) return null;
  const kp = Keypair.fromSecret(secretKey);
  const tx = new TransactionBuilder(new Account(kp.publicKey(), sequence), { fee, networkPassphrase: PI_TESTNET_PASSPHRASE })
    .addOperation(Operation.payment({ destination: kp.publicKey(), asset: Asset.native(), amount: '0.0000001' }))
    .addMemo(Memo.hash(hashHex))
    .setTimeout(60)
    .build();
  tx.sign(kp);
  return { xdr: tx.toEnvelope().toXDR('base64'), txid: tx.hash().toString('hex') };
}

export type AnchorResult = { ok: true; txid: string; ledger?: number } | { ok: false; error: 'bad_hash' | 'account' | 'rejected' | 'network' };

/** Anchors one fingerprint. Never throws; the error is a short code (no secrets, no raw responses). */
export async function anchorHash(secretKey: string, hashHex: string, opts: { horizon?: string; fee?: string; timeoutMs?: number } = {}): Promise<AnchorResult> {
  const horizon = opts.horizon ?? PI_TESTNET_HORIZON;
  const signal = () => AbortSignal.timeout(opts.timeoutMs ?? 8000);
  try {
    if (!HASH_RE.test(hashHex)) return { ok: false, error: 'bad_hash' };
    const pub = Keypair.fromSecret(secretKey).publicKey();
    const acc = await fetch(`${horizon}/accounts/${pub}`, { cache: 'no-store', signal: signal() });
    if (!acc.ok) return { ok: false, error: 'account' };
    const sequence = String((await acc.json())?.sequence ?? '');
    if (!/^\d+$/.test(sequence)) return { ok: false, error: 'account' };
    const built = buildAnchorTx(secretKey, sequence, hashHex, opts.fee);
    if (!built) return { ok: false, error: 'bad_hash' };
    const res = await fetch(`${horizon}/transactions`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ tx: built.xdr }).toString(), signal: signal(),
    });
    if (!res.ok) return { ok: false, error: 'rejected' };
    const j = await res.json().catch(() => null);
    return { ok: true, txid: typeof j?.hash === 'string' ? j.hash : built.txid, ledger: typeof j?.ledger === 'number' ? j.ledger : undefined };
  } catch {
    return { ok: false, error: 'network' };
  }
}
