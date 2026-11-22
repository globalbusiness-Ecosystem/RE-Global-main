import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { summarizeActivity, type AuditRow, type ActorSummary } from '@/lib/admin-report';

/** The admin log of the last `hours` hours, summarised per admin. */
export async function activityReport(hours: number): Promise<ActorSummary[]> {
  const since = Timestamp.fromMillis(Date.now() - hours * 3600 * 1000);
  const snap = await adminDb.collection('admin_audit').where('at', '>=', since).orderBy('at', 'desc').limit(3000).get();
  const rows: AuditRow[] = snap.docs.map((d) => { const x = d.data(); return { action: String(x.action ?? ''), detail: (x.detail ?? {}) as Record<string, unknown>, atMs: x.at?.toMillis?.() ?? 0 }; });
  return summarizeActivity(rows);
}
