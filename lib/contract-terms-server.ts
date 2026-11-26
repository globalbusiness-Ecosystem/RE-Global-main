import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { parseStored, type TermsOverrides } from '@/lib/contract-terms';

// The admin's published contract terms (Firestore settings/contractTerms), or undefined for the built-in text.
// Never throws: if Firestore is slow, down, or holds something that does not pass the rules, the built-in text is used.
export async function getContractTerms(): Promise<TermsOverrides | undefined> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('contractTerms').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('contract terms timeout')), 3000)),
    ]);
    return snap.exists ? parseStored(snap.data()) : undefined;
  } catch {
    return undefined;
  }
}
