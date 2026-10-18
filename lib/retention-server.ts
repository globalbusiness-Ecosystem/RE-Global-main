import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { retentionRules } from '@/lib/retention';

const BATCH = 400;
const MAX_ROUNDS = 5; // up to 2000 documents per rule per run; the next day's run continues

export type RetentionResult = { collection: string; deleted: number; error?: boolean };

// Deletes records older than their retention period. One failing collection never stops the others.
export async function runRetention(now: Date = new Date()): Promise<RetentionResult[]> {
  const out: RetentionResult[] = [];
  for (const rule of retentionRules(now)) {
    let deleted = 0;
    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        const snap = await adminDb.collection(rule.collection).where(rule.field, '<', Timestamp.fromDate(rule.before)).limit(BATCH).get();
        if (snap.empty) break;
        const batch = adminDb.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        deleted += snap.size;
        if (snap.size < BATCH) break;
      }
      out.push({ collection: rule.collection, deleted });
    } catch (err) {
      console.error('[retention] failed for', rule.collection, err);
      out.push({ collection: rule.collection, deleted, error: true });
    }
  }
  return out;
}
