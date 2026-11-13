import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_BRANDING, parseBranding, type Branding } from '@/lib/branding';

// settings/branding. The built-in logo when nothing is saved or the database cannot be reached.
export async function getBranding(): Promise<Branding> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('branding').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('branding timeout')), 3000)),
    ]);
    return snap.exists ? parseBranding(snap.data()) : DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
}
