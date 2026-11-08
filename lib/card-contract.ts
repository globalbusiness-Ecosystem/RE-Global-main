import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { generateContractText, hashContract, signContractHash } from '@/lib/contract-signing';
import { getLegalProfile } from '@/lib/legal-server';
import { anchorHash } from '@/lib/chain-anchor';
import { buyerRef, recordOnRegistry, registryKind } from '@/lib/registry-client';
import { webUsername } from '@/lib/web-auth';
import type { CardOrder } from '@/lib/card-pay/order';

// A card payment gets the same signed contract a Pi payment gets (same collections, same /verify page), and the
// contract's fingerprint is anchored on the Pi blockchain. The contract is saved first; anchoring is best effort and
// can be repeated from the admin panel, so a blockchain outage never loses a contract or blocks a payment.

const keys = () => {
  const secret = process.env.PI_ISSUER_SECRET_KEY, pub = process.env.PI_ISSUER_PUBLIC_KEY;
  return secret && pub ? { secret, pub } : null;
};

/** Creates (once) the contract of a paid card order and tries to anchor it. Returns the contract id, or null when signing is not configured. */
export async function createCardContract(o: CardOrder): Promise<string | null> {
  const k = keys();
  if (!k || !o.propertyId || !o.uid.startsWith('web_')) return null;
  const [prop, kyc] = await Promise.all([adminDb.collection('properties').doc(o.propertyId).get(), adminDb.collection('kyc').doc(o.uid).get()]);
  const p = prop.data() ?? {};
  const buyerName = String(kyc.data()?.legalName ?? '').slice(0, 100) || 'verified buyer';
  const title = String(p.title ?? '').slice(0, 150) || `Property ${o.propertyId}`;
  const legal = await getLegalProfile(typeof p.country === 'string' ? p.country : '');
  const buyerUsername = webUsername(o.uid.slice(4));
  const type = typeof o.booking?.type === 'string' && o.booking.type ? o.booking.type : String(p.type ?? 'buy');
  const amount = o.amountMinor / 100;

  const ref = adminDb.collection('signed_contracts').doc(o.id);
  const publicRef = adminDb.collection('contracts').doc(o.id);
  const contractId = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return String(snap.data()?.contractId ?? '');
    const id = `${o.id}-${Date.now().toString(36)}`;
    const text = generateContractText({
      contractId: id, propertyId: o.propertyId!, propertyTitle: title, buyerUsername, sellerUsername: 'RE-Global-Platform',
      type, amount, currency: o.currency, paymentId: o.id, txid: '',
      booking: o.booking ? { start: o.booking.start, end: o.booking.end, nights: o.booking.nights } : undefined,
      legal: { statusLine: legal.statusLine, governingLaw: legal.governingLaw, extraClause: legal.extraClause },
      card: { orderId: o.id, buyerName },
    });
    const hash = hashContract(text);
    const signedAt = new Date().toISOString();
    const base = {
      contractId: id, contractText: text, contractHash: hash, platformSignature: signContractHash(hash, k.secret), platformPublicKey: k.pub, signedAt,
      buyerUsername, amount, currency: o.currency, type, propertyId: o.propertyId, propertyTitle: title, txid: '', paymentMethod: 'card',
      anchor: { status: 'pending' },
      // true while the ownership registry (smart contract) is configured and this contract is not in it yet
      registryPending: !!process.env.REGISTRY_CONTRACT_ID,
    };
    tx.set(ref, { uid: o.uid, ...base });
    tx.set(publicRef, { ...base, sellerUsername: 'RE-Global-Platform', status: 'completed', paymentId: o.id, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return id;
  });
  await anchorContract(o.id).catch(() => {});
  await recordContract(o.id).catch(() => {});
  return contractId || null;
}

/** Anchors a card contract's fingerprint on the blockchain (if not done yet). Returns what happened. */
export async function anchorContract(orderId: string): Promise<'anchored' | 'already' | 'missing' | 'not_configured' | 'failed'> {
  const k = keys();
  if (!k) return 'not_configured';
  const ref = adminDb.collection('signed_contracts').doc(orderId);
  const snap = await ref.get();
  const d = snap.data();
  if (!snap.exists || !d || d.paymentMethod !== 'card') return 'missing';
  if (typeof d.txid === 'string' && d.txid) return 'already';
  const r = await anchorHash(k.secret, String(d.contractHash ?? ''));
  const publicRef = adminDb.collection('contracts').doc(orderId);
  if (!r.ok) {
    await Promise.all([ref.update({ anchor: { status: 'pending', error: r.error } }), publicRef.update({ anchor: { status: 'pending', error: r.error } })]).catch(() => {});
    return 'failed';
  }
  const done = { txid: r.txid, anchor: { status: 'anchored', ledger: r.ledger ?? null, at: new Date().toISOString() } };
  await Promise.all([ref.update(done), publicRef.update({ ...done, updatedAt: Timestamp.now() })]);
  return 'anchored';
}

/** Writes a card contract into the ownership registry smart contract (if one is configured and it is not in yet). */
export async function recordContract(orderId: string): Promise<'recorded' | 'already' | 'missing' | 'not_configured' | 'failed'> {
  const k = keys();
  const registryId = process.env.REGISTRY_CONTRACT_ID;
  if (!k || !registryId) return 'not_configured';
  const ref = adminDb.collection('signed_contracts').doc(orderId);
  const snap = await ref.get();
  const d = snap.data();
  if (!snap.exists || !d || d.paymentMethod !== 'card') return 'missing';
  if (d.registry?.status === 'recorded') return 'already';
  const r = await recordOnRegistry(k.secret, registryId, {
    propertyId: String(d.propertyId ?? ''), buyerRef: buyerRef(String(d.uid ?? '')), contractHash: String(d.contractHash ?? ''), kind: registryKind(String(d.type ?? '')),
  });
  const publicRef = adminDb.collection('contracts').doc(orderId);
  if (!r.ok) {
    await Promise.all([ref.update({ registry: { status: 'pending', error: r.error }, registryPending: true }), publicRef.update({ registry: { status: 'pending', error: r.error } })]).catch(() => {});
    return 'failed';
  }
  const done = { registry: { status: 'recorded', entryId: r.entryId, txid: r.txid, contractId: registryId, at: new Date().toISOString() } };
  await Promise.all([ref.update({ ...done, registryPending: false }), publicRef.update({ ...done, updatedAt: Timestamp.now() })]);
  return 'recorded';
}
