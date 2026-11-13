import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_HOME_FEATURES, parseHomeFeatures, type HomeFeatures } from '@/lib/home-features';

// settings/homeFeatures. The built-in strip when nothing is saved or the database cannot be reached.
export async function getHomeFeatures(): Promise<HomeFeatures> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('homeFeatures').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('home features timeout')), 3000)),
    ]);
    return snap.exists ? parseHomeFeatures(snap.data()) : DEFAULT_HOME_FEATURES;
  } catch {
    return DEFAULT_HOME_FEATURES;
  }
}
