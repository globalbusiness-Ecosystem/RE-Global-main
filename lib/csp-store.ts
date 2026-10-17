import 'server-only';
import crypto from 'crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import type { CspRecord } from '@/lib/csp-report';

// One counter document per (directive, blocked source), so a flood of identical reports is one small write.
export async function recordCsp(rec: CspRecord): Promise<void> {
  const id = crypto.createHash('sha1').update(`${rec.directive}|${rec.blocked}`).digest('hex').slice(0, 20);
  await adminDb.collection('csp_reports').doc(id).set(
    { directive: rec.directive, blocked: rec.blocked, lastPage: rec.page, count: FieldValue.increment(1), lastAt: Timestamp.now() },
    { merge: true },
  );
}

export async function listCsp(max = 50) {
  const snap = await adminDb.collection('csp_reports').orderBy('count', 'desc').limit(max).get();
  return snap.docs.map((d) => {
    const x = d.data();
    return { id: d.id, directive: String(x.directive ?? ''), blocked: String(x.blocked ?? ''), page: String(x.lastPage ?? ''), count: Number(x.count) || 0, lastAt: x.lastAt?.toDate?.().toISOString() ?? null };
  });
}
