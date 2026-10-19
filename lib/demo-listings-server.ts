import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { parseShowDemo } from '@/lib/demo-listings';

// settings/display.showDemoListings. True (visible) when unset or when the database cannot be reached.
export async function getShowDemo(): Promise<boolean> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('display').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('display settings timeout')), 3000)),
    ]);
    return parseShowDemo(snap.exists ? snap.data()?.showDemoListings : undefined);
  } catch {
    return true;
  }
}
