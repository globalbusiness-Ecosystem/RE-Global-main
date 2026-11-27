import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { ownerLine, parseStoredOwner } from '@/lib/property-owner';

// The masked owner line for a property's contract, or undefined when none is recorded. Never throws.
export async function getOwnerLine(propertyId: string): Promise<string | undefined> {
  if (!propertyId || propertyId.includes('/')) return undefined;
  try {
    const snap = await Promise.race([
      adminDb.collection('property_owners').doc(propertyId).get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('owner lookup timeout')), 3000)),
    ]);
    const o = snap.exists ? parseStoredOwner(snap.data()) : undefined;
    return o ? ownerLine(o) : undefined;
  } catch {
    return undefined;
  }
}
