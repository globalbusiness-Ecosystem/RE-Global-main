import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_FOUNDER, parseFounder, type Founder } from '@/lib/founder';

// settings/founder holds what visitors may see. settings/founderAccount holds which account is the founder; it is only
// ever compared on the server, so the account id never reaches a visitor.
const withTimeout = <T,>(p: Promise<T>) => Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('founder timeout')), 3000))]);

export async function getFounder(): Promise<Founder> {
  try {
    const snap = await withTimeout(adminDb.collection('settings').doc('founder').get());
    return snap.exists ? parseFounder(snap.data()) : DEFAULT_FOUNDER;
  } catch {
    return DEFAULT_FOUNDER;
  }
}

export async function getFounderUid(): Promise<string | null> {
  try {
    const snap = await withTimeout(adminDb.collection('settings').doc('founderAccount').get());
    const uid = snap.exists ? snap.data()?.uid : null;
    return typeof uid === 'string' && uid.length > 0 && uid.length <= 200 ? uid : null;
  } catch {
    return null;
  }
}

export const isFounderUid = async (uid: string) => (await getFounderUid()) === uid;
