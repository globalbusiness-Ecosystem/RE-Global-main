import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getLegalProfile } from '@/lib/legal-server';
import { feePctOf, feeSplit } from '@/lib/market-rules';
import { generateResaleContractText, hashContract, signContractHash } from '@/lib/contract-signing';

const cleanName = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

// Writes the signed contract for one settled resale. One payment -> one contract (idempotent).
// Returns null when platform signing is not configured, so a missing key never blocks the settlement itself.
export async function signResaleContract(a: { paymentId: string; txid: string; listingId: string; buyerName: string; amount: number }): Promise<{ contractId: string } | null> {
  const secretKey = process.env.PI_ISSUER_SECRET_KEY;
  const publicKey = process.env.PI_ISSUER_PUBLIC_KEY;
  if (!secretKey || !publicKey) { console.error('[resale-contract] platform signing is not configured'); return null; }

  const ref = adminDb.collection('signed_contracts').doc(a.paymentId);
  const publicRef = adminDb.collection('contracts').doc(a.paymentId);
  const existing = await ref.get();
  if (existing.exists) return { contractId: String(existing.data()?.contractId ?? a.paymentId) };

  const lSnap = await adminDb.collection('share_listings').doc(a.listingId).get();
  if (!lSnap.exists) return null;
  const l = lSnap.data() as Record<string, unknown>;
  const propertyId = String(l.propertyId ?? '');
  const pSnap = propertyId && !propertyId.includes('/') ? await adminDb.collection('properties').doc(propertyId).get() : null;
  const p = (pSnap && pSnap.exists ? pSnap.data() : {}) as Record<string, unknown>;
  const totalShares = Number(p.totalShares) > 0 ? Number(p.totalShares) : null;
  const legal = await getLegalProfile(typeof p.country === 'string' ? p.country : '');
  const { fee, proceeds } = feeSplit(a.amount, feePctOf(l.feePct));

  const contractId = `${a.paymentId}-${Date.now().toString(36)}`;
  const propertyTitle = cleanName(l.propertyTitle, 150) || `Property ${propertyId}`;
  const sellerUsername = cleanName(l.sellerName, 64) || 'seller';
  const text = generateResaleContractText({
    contractId, propertyId, propertyTitle, sellerUsername, buyerUsername: a.buyerName,
    shares: Number(l.shares) || 0, totalShares, pricePerShare: Number(l.pricePerShare) || 0,
    amount: a.amount, fee, proceeds, currency: 'Pi', paymentId: a.paymentId, txid: a.txid,
    legal: { statusLine: legal.statusLine, governingLaw: legal.governingLaw, extraClause: legal.extraClause },
  });
  const contractHash = hashContract(text);
  const signedAt = new Date().toISOString();
  const platformSignature = signContractHash(contractHash, secretKey);
  const created = await adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (s.exists) return String(s.data()?.contractId ?? contractId);
    tx.set(ref, { contractId, contractText: text, contractHash, platformSignature, platformPublicKey: publicKey, signedAt, buyerUsername: a.buyerName, sellerUsername, amount: a.amount, currency: 'Pi', type: 'resale', propertyId, propertyTitle, txid: a.txid });
    tx.set(publicRef, {
      propertyId, propertyTitle, buyerUsername: a.buyerName, sellerUsername, type: 'resale', amount: a.amount, currency: 'Pi', status: 'completed',
      paymentId: a.paymentId, txid: a.txid, contractText: text, contractHash, platformSignature, platformPublicKey: publicKey, signedAt,
      createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    });
    return contractId;
  });
  return { contractId: created };
}
