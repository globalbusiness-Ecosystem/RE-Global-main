// Pure helpers of the public blockchain explorer (no network, no secrets).

type QueryKind = 'hash' | 'id' | 'invalid';

const HEX64 = /^[0-9a-fA-F]{64}$/;
const ID = /^[A-Za-z0-9_-]{6,80}$/;

/** What the person typed: a 64-character hash (transaction or contract fingerprint), a contract number, or nonsense. */
export function classifyQuery(raw: string): { kind: QueryKind; q: string } {
  const q = String(raw ?? '').trim();
  if (HEX64.test(q)) return { kind: 'hash', q: q.toLowerCase() };
  if (ID.test(q)) return { kind: 'id', q };
  return { kind: 'invalid', q };
}

export type ChainTx = { hash: string; successful: boolean; ledger: number | null; createdAt: string | null; source: string | null; memoHex: string | null };

/** Turns a Horizon transaction record into the few fields the page shows. A "hash" memo comes as base64: we show it as hex. */
export function shapeTx(j: unknown): ChainTx | null {
  const o = j as Record<string, unknown> | null;
  if (!o || typeof o.hash !== 'string' || !HEX64.test(o.hash)) return null;
  let memoHex: string | null = null;
  if (o.memo_type === 'hash' && typeof o.memo === 'string') {
    const hex = Buffer.from(o.memo, 'base64').toString('hex');
    if (HEX64.test(hex)) memoHex = hex;
  }
  return {
    hash: o.hash.toLowerCase(),
    successful: o.successful === true,
    ledger: typeof o.ledger === 'number' ? o.ledger : null,
    createdAt: typeof o.created_at === 'string' ? o.created_at : null,
    source: typeof o.source_account === 'string' ? o.source_account : null,
    memoHex,
  };
}

/** True when the fingerprint written on the chain is exactly the contract's own fingerprint. */
export function fingerprintMatches(memoHex: string | null, contractHash: unknown): boolean {
  return !!memoHex && typeof contractHash === 'string' && memoHex === contractHash.toLowerCase();
}
