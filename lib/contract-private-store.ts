import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { newSalt, proofOf, matchesCommitment, proofFromText, type IdentityProof } from '@/lib/contract-privacy';

// The private side of a contract: legal name, ID number, phone and the salt of the public commitment.
// Stored in contract_private/<contract doc id>. No client rule exists for it, so only the server reads it:
// /api/contracts/private for the owner, and the admin KYC panel for the team.

export type PrivateIdentity = { proof: IdentityProof; record: Record<string, unknown> };

export const privateRef = (docId: string) => adminDb.collection('contract_private').doc(docId);

/** The identity of a buyer for a new contract: the masked proof (goes into the public text) and the private record (saved with the contract). Null unless the buyer's KYC is approved and has an ID number. */
export async function identityFor(uid: string): Promise<PrivateIdentity | null> {
  try {
    const d = (await adminDb.collection('kyc').doc(uid).get()).data();
    if (!d || d.status !== 'approved') return null;
    const legalName = String(d.legalName ?? ''), idNumber = String(d.idNumber ?? '');
    const salt = newSalt();
    const proof = proofOf(salt, legalName, idNumber);
    if (!proof) return null;
    return {
      proof,
      record: { uid, legalName, idNumber, phone: String(d.phone ?? ''), country: String(d.country ?? ''), docType: String(d.docType ?? ''), salt, commitment: proof.commitment, createdAt: Timestamp.now() },
    };
  } catch {
    return null; // a lookup failure never blocks a signed sale; the contract is then simply written without the proof
  }
}

export type OwnerView =
  | { ok: true; legalName: string; idNumber: string; phone: string; country: string; commitmentValid: boolean; idLast4: string }
  | { ok: false; status: 403 | 404 };

/** The private details of a contract, only for an account of the person who owns it. `uids` = this person's linked account ids. */
export async function privateForOwner(docId: string, uids: string[]): Promise<OwnerView> {
  const [priv, pub] = await Promise.all([privateRef(docId).get(), adminDb.collection('contracts').doc(docId).get()]);
  if (!priv.exists) return { ok: false, status: 404 };
  const d = priv.data()!;
  if (!uids.includes(String(d.uid ?? ''))) return { ok: false, status: 403 };
  const proof = proofFromText(String(pub.data()?.contractText ?? ''));
  return {
    ok: true,
    legalName: String(d.legalName ?? ''), idNumber: String(d.idNumber ?? ''), phone: String(d.phone ?? ''), country: String(d.country ?? ''),
    commitmentValid: matchesCommitment(proof, String(d.salt ?? ''), String(d.legalName ?? ''), String(d.idNumber ?? '')),
    idLast4: proof?.idLast4 ?? '',
  };
}
