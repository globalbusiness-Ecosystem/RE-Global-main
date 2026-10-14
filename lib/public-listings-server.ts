import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { toPublicListing, type PublicListing } from '@/lib/public-listings';

const withTimeout = <T,>(p: Promise<T>) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))]);

// Never throws: a Firestore problem means "no listings", not a broken page or sitemap.
export async function getPublicListing(id: string): Promise<PublicListing | null> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  try {
    const snap = await withTimeout(adminDb.collection('properties').doc(id).get());
    return snap.exists ? toPublicListing(snap.id, snap.data()) : null;
  } catch {
    return null;
  }
}

export async function listPublicListings(max = 500): Promise<PublicListing[]> {
  try {
    const snap = await withTimeout(adminDb.collection('properties').limit(max).get());
    return snap.docs.map((d) => toPublicListing(d.id, d.data())).filter((x): x is PublicListing => !!x);
  } catch {
    return [];
  }
}
