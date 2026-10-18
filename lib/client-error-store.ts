import 'server-only';
import crypto from 'crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { errorSignature, type ClientErrorRecord } from '@/lib/client-error';

// One counter document per kind of error, so a crash loop on many devices is one small write each time.
// Returns true the first time this error is seen (the caller sends one alert for that).
export async function recordClientError(rec: ClientErrorRecord): Promise<boolean> {
  const id = crypto.createHash('sha1').update(errorSignature(rec)).digest('hex').slice(0, 20);
  const ref = adminDb.collection('client_errors').doc(id);
  return adminDb.runTransaction(async (tx) => {
    const first = !(await tx.get(ref)).exists;
    tx.set(ref, {
      kind: rec.kind, message: rec.message, stack: rec.stack, lastPage: rec.page,
      count: FieldValue.increment(1), lastAt: Timestamp.now(), ...(first ? { firstAt: Timestamp.now() } : {}),
    }, { merge: true });
    return first;
  });
}

export async function listClientErrors(max = 50) {
  const snap = await adminDb.collection('client_errors').orderBy('lastAt', 'desc').limit(max).get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id, kind: String(x.kind ?? ''), message: String(x.message ?? ''), stack: String(x.stack ?? ''), page: String(x.lastPage ?? ''),
      count: Number(x.count) || 0, lastAt: x.lastAt?.toDate?.().toISOString() ?? null, firstAt: x.firstAt?.toDate?.().toISOString() ?? null,
    };
  });
}
