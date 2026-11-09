import { Keypair } from '@stellar/stellar-sdk';
import { adminDb } from '@/lib/firebase-admin';
import { verifyContractSignature } from '@/lib/contract-signing';

/** The public key that belongs to a secret key, or null when the secret is not a valid key. */
export function publicOf(secret: string | undefined): string | null {
  if (!secret) return null;
  try { return Keypair.fromSecret(secret).publicKey(); } catch { return null; }
}

/**
 * The secret of the account that pays for blockchain records (fingerprint anchoring and the ownership registry).
 * A separate CHAIN_ANCHOR_SECRET_KEY can be set so this account is not the one that signs contracts; without it the signing key is used.
 */
export function anchorSecret(): string | undefined {
  return process.env.CHAIN_ANCHOR_SECRET_KEY || process.env.PI_ISSUER_SECRET_KEY || undefined;
}

/**
 * Contracts store the public key that signed them. Some were saved with the key from the settings instead of the key
 * of the secret that really signed. Fixes only the ones whose signature is proven by the real key. Returns how many were fixed.
 */
export async function repairPlatformKeys(max = 300): Promise<number> {
  const real = publicOf(process.env.PI_ISSUER_SECRET_KEY);
  if (!real) return 0;
  const snap = await adminDb.collection('signed_contracts').limit(max).get();
  let fixed = 0;
  for (const d of snap.docs) {
    const c = d.data();
    if (c.platformPublicKey === real || typeof c.contractHash !== 'string' || typeof c.platformSignature !== 'string') continue;
    if (!verifyContractSignature(c.contractHash, c.platformSignature, real)) continue;
    await Promise.all([d.ref.update({ platformPublicKey: real }), adminDb.collection('contracts').doc(d.id).update({ platformPublicKey: real }).catch(() => {})]);
    fixed++;
  }
  return fixed;
}
