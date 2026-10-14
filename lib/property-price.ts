import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { isUsdPegged, propertyPaymentAmount } from '@/lib/payment-rules';
import { getPiUsdRate } from '@/lib/pricing';

// The amount (in Pi) the platform expects for a Firestore property, or null when the
// property is not in Firestore (demo listings) or has no usable price (fee rule applies).
// Throws when Firestore cannot be reached, or when a USD-priced property has no Pi rate set,
// so callers fail closed instead of charging a wrong amount.
export async function lookupExpectedAmount(propertyId: string): Promise<number | null> {
  if (!propertyId || propertyId.includes('/')) return null;
  const snap = await Promise.race([
    adminDb.collection('properties').doc(propertyId).get(),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('property lookup timeout')), 4000)),
  ]);
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown>;
  const explicit = propertyPaymentAmount(d);
  if (explicit !== null || !isUsdPegged(d.currency)) return explicit;
  const rate = await getPiUsdRate();
  const converted = propertyPaymentAmount(d, rate);
  if (converted === null) throw new Error('Pi rate not set for a USD-priced property');
  return converted;
}
