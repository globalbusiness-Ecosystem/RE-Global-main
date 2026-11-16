import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_LOCK_IMAGE, parseLockImage, type LockImage } from '@/lib/lock-image';

// settings/lockImage. The fingerprint icon when nothing is saved or the database cannot be reached.
export async function getLockImage(): Promise<LockImage> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('lockImage').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('lock image timeout')), 3000)),
    ]);
    return snap.exists ? parseLockImage(snap.data()) : DEFAULT_LOCK_IMAGE;
  } catch {
    return DEFAULT_LOCK_IMAGE;
  }
}
