import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { propertyPaymentAmount } from '@/lib/payment-rules';

// The amount (in Pi) the platform expects for a Firestore property, or null when the
// property is not in Firestore (demo listings) or has no usable price (fee rule applies).
// Throws when Firestore cannot be reached, so callers fail closed instead of guessing.
export async function lookupExpectedAmount(propertyId: string): Promise<number | null> {
  if (!propertyId || propertyId.includes('/')) return null;
  const snap = await Promise.race([
    adminDb.collection('properties').doc(propertyId).get(),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('property lookup timeout')), 4000)),
  ]);
  return snap.exists ? propertyPaymentAmount(snap.data()) : null;
}
