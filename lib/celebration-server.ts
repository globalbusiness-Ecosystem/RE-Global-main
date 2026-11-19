import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_CELEBRATION, parseCelebration, type Celebration } from '@/lib/celebration';

// settings/celebration. Defaults when nothing is saved or the database cannot be reached.
export async function getCelebration(): Promise<Celebration> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('celebration').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('celebration timeout')), 3000)),
    ]);
    return snap.exists ? parseCelebration(snap.data()) : DEFAULT_CELEBRATION;
  } catch {
    return DEFAULT_CELEBRATION;
  }
}
