import 'server-only';
import { adminDb } from '@/lib/firebase-admin';

// Admin-set rate: how many US dollars one Pi is worth. null = not set.
// Throws when Firestore cannot be reached so callers can fail closed.
export async function getPiUsdRate(): Promise<number | null> {
  const snap = await Promise.race([
    adminDb.collection('settings').doc('pricing').get(),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('pricing lookup timeout')), 4000)),
  ]);
  const r = Number(snap.exists ? snap.data()?.piUsdRate : NaN);
  return Number.isFinite(r) && r > 0 ? r : null;
}
