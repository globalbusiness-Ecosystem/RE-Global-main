import crypto from 'crypto';

// Privacy inside a contract. A contract is public (anyone with the link can read and verify it), so it never carries the
// ID number, phone or legal name of an alias buyer. It carries only:
//  - the last 4 characters of the ID number, and
//  - a commitment: SHA-256 over (salt | legal name | ID number). Nobody can reverse it, but the owner (who can read the
//    private record with the salt) can prove the full details match what was signed.
// The full details live in a private record that only the contract owner (and the platform team) can read.

export type IdentityProof = { idLast4: string; commitment: string };

const clean = (v: string) => v.replace(/[\s-]/g, '').toUpperCase();

/** Last 4 characters of an ID number (spaces and dashes ignored). Empty when it is too short to mask safely. */
export function idLast4(idNumber: string): string {
  const c = clean(String(idNumber ?? ''));
  return c.length >= 5 ? c.slice(-4) : '';
}

export const newSalt = (): string => crypto.randomBytes(16).toString('hex');

/** The commitment that goes into the public contract text. */
export function commitmentOf(salt: string, legalName: string, idNumber: string): string {
  return crypto.createHash('sha256').update(`${salt}|${String(legalName).trim()}|${clean(String(idNumber))}`).digest('hex');
}

/** The public proof for a person, or null when the ID number is missing or too short. */
export function proofOf(salt: string, legalName: string, idNumber: string): IdentityProof | null {
  const last4 = idLast4(idNumber);
  return last4 && legalName.trim() ? { idLast4: last4, commitment: commitmentOf(salt, legalName, idNumber) } : null;
}

/** The sentence added to the Party A line. */
export const proofText = (p: IdentityProof): string => `ID ending ${p.idLast4}, identity commitment ${p.commitment}`;

/** Reads the proof back out of a contract text (for the owner view and for verification). */
export function proofFromText(text: string | undefined): IdentityProof | null {
  const m = /ID ending ([A-Z0-9]{4}), identity commitment ([a-f0-9]{64})/.exec(text ?? '');
  return m ? { idLast4: m[1], commitment: m[2] } : null;
}

/** True when the private details (with their salt) match the commitment written in the contract. */
export function matchesCommitment(p: IdentityProof | null, salt: string, legalName: string, idNumber: string): boolean {
  return !!p && commitmentOf(salt, legalName, idNumber) === p.commitment && idLast4(idNumber) === p.idLast4;
}
