import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { cleanWatchlist } from '@/lib/kyc-screening';

// settings/kycWatchlist { names: string[] }: written by the admin route only.
export async function getWatchlist(): Promise<string[]> {
  try {
    return cleanWatchlist((await adminDb.collection('settings').doc('kycWatchlist').get()).data()?.names);
  } catch {
    return []; // an unreadable list never blocks a request
  }
}
export async function setWatchlist(names: string[]): Promise<void> {
  await adminDb.collection('settings').doc('kycWatchlist').set({ names: cleanWatchlist(names) });
}
