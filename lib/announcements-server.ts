import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_ANNOUNCEMENTS, parseAnnouncements, type Announcements } from '@/lib/announcements';

// settings/announcements. Nothing to show (and the stats stay hidden) when nothing is saved or the database cannot be reached.
export async function getAnnouncements(): Promise<Announcements> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('announcements').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('announcements timeout')), 3000)),
    ]);
    return snap.exists ? parseAnnouncements(snap.data()) : DEFAULT_ANNOUNCEMENTS;
  } catch {
    return DEFAULT_ANNOUNCEMENTS;
  }
}
