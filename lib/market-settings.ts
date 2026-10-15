import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { RESALE_FEE_PCT, feePctOf } from '@/lib/market-rules';

// Admin-set resale fee percent (settings/market). Falls back to the default when unset or unreachable.
export async function getResaleFeePct(): Promise<number> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('market').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('market settings timeout')), 3000)),
    ]);
    return feePctOf(snap.exists ? snap.data()?.resaleFeePct : undefined);
  } catch {
    return RESALE_FEE_PCT;
  }
}
