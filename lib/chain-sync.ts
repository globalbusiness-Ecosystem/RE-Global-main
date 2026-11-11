import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { repairPlatformKeys } from '@/lib/signing-keys';
import { anchorContract, createMissingCardContracts, recordContract } from '@/lib/card-contract';

export type ChainSyncResult = { created: number; createdFailed: number; anchored: number; recorded: number; failed: number; total: number; errors: string[]; keysRepaired: number };

/**
 * Brings card contracts up to date on the blockchain (up to `max` per run): creates contracts that are missing, fixes old signing keys,
 * anchors fingerprints that are not on the chain yet and writes them to the ownership registry. Safe to repeat.
 * Used by the admin button and by the daily job, so a contract does not wait for a person to press anything.
 */
export async function syncCardContracts(max = 10): Promise<ChainSyncResult> {
  // Paid card orders that never got a contract come first (paid before contracts existed, or while signing was off).
  const made = await createMissingCardContracts(max);
  const keysRepaired = await repairPlatformKeys().catch(() => 0);
  const col = adminDb.collection('signed_contracts');
  const [a, b] = await Promise.all([
    col.where('paymentMethod', '==', 'card').where('txid', '==', '').limit(max).get(),
    col.where('paymentMethod', '==', 'card').where('registryPending', '==', true).limit(max).get(),
  ]);
  const ids = [...new Set([...a.docs, ...b.docs].map((d) => d.id))].slice(0, max);
  const out: ChainSyncResult = { created: made.created, createdFailed: made.failed, anchored: 0, recorded: 0, failed: 0, total: ids.length, errors: [], keysRepaired };
  // Short error codes of the attempts that failed (never a secret), so the panel can say what to fix.
  const why = async (id: string, field: 'anchor' | 'registry') => {
    const e = (await col.doc(id).get()).data()?.[field]?.error;
    if (typeof e === 'string' && !out.errors.includes(`${field}:${e}`)) out.errors.push(`${field}:${e}`);
  };
  for (const id of ids) {
    const r = await anchorContract(id);
    if (r === 'anchored') out.anchored++; else if (r === 'failed' || r === 'not_configured') { out.failed++; if (r === 'failed') await why(id, 'anchor'); }
    const g = await recordContract(id);
    if (g === 'recorded') out.recorded++; else if (g === 'failed') { out.failed++; await why(id, 'registry'); }
  }
  return out;
}
