import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

// The last 200 admin actions (newest first) for the full activity log.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const snap = await adminDb.collection('admin_audit').orderBy('at', 'desc').limit(200).get();
    const rows = snap.docs.map((d) => {
      const a = d.data();
      return { id: d.id, action: String(a.action ?? ''), detail: a.detail ?? {}, at: a.at?.toDate?.().toISOString() ?? null };
    });
    return NextResponse.json({ ok: true, rows }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/audit] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
