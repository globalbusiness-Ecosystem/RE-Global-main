import 'server-only';
import { unstable_cache } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_FOUNDER, parseFounder, type Founder } from '@/lib/founder';
import { parseFounderUids } from '@/lib/founder-accounts';

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

// One person can have several accounts (a web account and a Pi account), so the founder is a short list of ids.
// Older data kept a single `uid`; it is still read.
export async function getFounderUids(): Promise<string[]> {
  try {
    const snap = await withTimeout(adminDb.collection('settings').doc('founderAccount').get());
    return snap.exists ? parseFounderUids(snap.data()) : [];
  } catch {
    return [];
  }
}

export const isFounderUid = async (uid: string) => (await getFounderUids()).includes(uid);

// Search-engine pages read the founder often; one database read an hour is plenty.
export const getFounderCached = unstable_cache(getFounder, ['founder-public'], { revalidate: 3600 });
