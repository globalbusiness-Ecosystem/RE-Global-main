import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import type { ReportInput, ReportStatus } from '@/lib/listing-report';

export async function createListingReport(r: ReportInput): Promise<string> {
  const ref = await adminDb.collection('listing_reports').add({ ...r, status: 'open', createdAt: Timestamp.now() });
  return ref.id;
}

// Open reports, newest first (sorted here so no extra Firestore index is needed).
export async function listOpenReports(max = 100) {
  const snap = await adminDb.collection('listing_reports').where('status', '==', 'open').limit(max).get();
  return snap.docs
    .map((d) => {
      const x = d.data();
      return { id: d.id, listingId: String(x.listingId ?? ''), reason: String(x.reason ?? ''), details: String(x.details ?? ''), email: String(x.email ?? ''), createdAt: x.createdAt?.toDate?.().toISOString() ?? null };
    })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

/** 200 done, 404 missing, 409 already handled. */
export async function resolveListingReport(id: string, status: Exclude<ReportStatus, 'open'>, note: string): Promise<200 | 404 | 409> {
  const ref = adminDb.collection('listing_reports').doc(id);
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) return 404 as const;
    if (s.data()?.status !== 'open') return 409 as const;
    tx.update(ref, { status, note, resolvedAt: Timestamp.now() });
    return 200 as const;
  });
}
