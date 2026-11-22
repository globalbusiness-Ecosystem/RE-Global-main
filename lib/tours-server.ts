import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { parseToursEnabled, tourItems, type TourItem } from '@/lib/tours';
import { getShowDemo } from '@/lib/demo-listings-server';

// settings/tours { enabled }. On when unset or when the database cannot be reached.
export async function getToursEnabled(): Promise<boolean> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('tours').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('tours settings timeout')), 3000)),
    ]);
    return parseToursEnabled(snap.exists ? snap.data()?.enabled : undefined);
  } catch { return true; }
}

export async function listTours(): Promise<{ items: TourItem[]; total: number }> {
  const snap = await adminDb.collection('properties').select('title', 'titleAr', 'location', 'locationAr', 'image', 'images', 'vrUrl', 'hidden').limit(500).get();
  const items = tourItems(snap.docs.map((d) => ({ id: d.id, data: d.data() })), 60);
  return { items, total: items.length };
}

export const toursPublic = async () => {
  const [enabled, demo, list] = await Promise.all([getToursEnabled(), getShowDemo(), listTours().catch(() => ({ items: [] as TourItem[], total: 0 }))]);
  return { enabled, demo, items: enabled ? list.items : [] };
};
