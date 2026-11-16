import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_ABOUT, parseAbout, type AboutSettings } from '@/lib/about-settings';

// settings/about. Empty settings when nothing is saved or the database cannot be reached (the page still shows its texts).
export async function getAbout(): Promise<AboutSettings> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('about').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('about timeout')), 3000)),
    ]);
    return snap.exists ? parseAbout(snap.data()) : DEFAULT_ABOUT;
  } catch {
    return DEFAULT_ABOUT;
  }
}
