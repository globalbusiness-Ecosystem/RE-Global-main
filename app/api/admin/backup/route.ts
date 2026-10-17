import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { rateLimited } from '@/lib/rate-guard';
import { BACKUP_COLLECTIONS, BACKUP_MAX_DOCS, backupFilename, isBackupCollection, serializeValue } from '@/lib/backup';

export const dynamic = 'force-dynamic';

// GET: the list of collections that can be exported.
// GET ?c=<collection>: that collection as a JSON file (up to 5000 documents). Admin only, rate limited, logged.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const c = req.nextUrl.searchParams.get('c');
  if (c === null) return NextResponse.json({ ok: true, collections: BACKUP_COLLECTIONS }, { headers: { 'Cache-Control': 'no-store' } });
  if (!isBackupCollection(c)) return NextResponse.json({ ok: false, error: 'Unknown collection' }, { status: 400 });
  const limited = await rateLimited('backup', 'admin', 30, 60 * 60 * 1000);
  if (limited) return limited;
  try {
    const snap = await adminDb.collection(c).limit(BACKUP_MAX_DOCS + 1).get();
    const truncated = snap.size > BACKUP_MAX_DOCS;
    const docs = snap.docs.slice(0, BACKUP_MAX_DOCS).map((d) => ({ id: d.id, data: serializeValue(d.data()) }));
    await logAdmin('admin.backup', { collection: c, docs: docs.length });
    return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), collection: c, count: docs.length, truncated, docs }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${backupFilename(c)}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[admin/backup] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
