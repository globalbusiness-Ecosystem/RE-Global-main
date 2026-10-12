import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

/** Best-effort activity log for admin actions (never blocks or fails the action). */
export async function logAdmin(action: string, detail: Record<string, unknown> = {}): Promise<void> {
  try {
    await adminDb.collection('admin_audit').add({ action, detail, at: Timestamp.now() });
  } catch (err) {
    console.error('[admin-audit] failed:', err);
  }
}
