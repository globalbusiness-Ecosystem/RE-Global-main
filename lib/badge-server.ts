import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { BADGE_THRESHOLDS, parseThresholds } from '@/lib/badge-level';

// The points each badge level starts at. The admin can change them; anything invalid falls back to the defaults.
export async function getBadgeThresholds(): Promise<number[]> {
  try {
    const snap = await adminDb.collection('settings').doc('badges').get();
    return (snap.exists ? parseThresholds(snap.data()?.thresholds) : null) ?? [...BADGE_THRESHOLDS];
  } catch {
    return [...BADGE_THRESHOLDS];
  }
}
