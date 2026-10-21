import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { toPublicListing, withRating, type PublicListing } from '@/lib/public-listings';
import { publicReviews } from '@/lib/stay-reviews-server';

const withTimeout = <T,>(p: Promise<T>) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))]);

// Never throws: a Firestore problem means "no listings", not a broken page or sitemap.
export async function getPublicListing(id: string): Promise<PublicListing | null> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  try {
    const snap = await withTimeout(adminDb.collection('properties').doc(id).get());
    const l = snap.exists ? toPublicListing(snap.id, snap.data()) : null;
    if (!l || (l.type !== 'hotel' && l.type !== 'rent')) return l;
    // The review average is optional: a problem here must never break the page.
    try { return withRating(l, (await withTimeout(publicReviews(l.id))).summary); } catch { return l; }
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
