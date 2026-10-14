import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { isCountry, mergeProfile, type LegalOverride, type LegalProfile } from '@/lib/legal-profiles';

// Wording for a country: the admin's edits (Firestore legal_profiles/{code}) over the built-in defaults.
// Never throws: if Firestore is slow or down, the built-in defaults are used.
export async function getLegalProfile(code: string | null | undefined): Promise<LegalProfile> {
  const c = code && isCountry(code) ? code : null;
  if (!c) return mergeProfile(null, null);
  try {
    const snap = await Promise.race([
      adminDb.collection('legal_profiles').doc(c).get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('legal lookup timeout')), 3000)),
    ]);
    return mergeProfile(c, snap.exists ? (snap.data() as LegalOverride) : null);
  } catch {
    return mergeProfile(c, null);
  }
}
