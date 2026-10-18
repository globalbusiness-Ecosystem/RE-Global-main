import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { listOpenReports, resolveListingReport } from '@/lib/listing-report-store';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// Open reports about listings, newest first.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ ok: true, rows: await listOpenReports() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/listing-reports] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { id, status: 'resolved' | 'dismissed', note? } closes a report.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id || id.includes('/') || id.length > 128) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  if (body?.status !== 'resolved' && body?.status !== 'dismissed') return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
  const note = typeof body?.note === 'string' ? body.note.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 300) : '';
  try {
    const r = await resolveListingReport(id, body.status, note);
    if (r === 404) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (r === 409) return NextResponse.json({ ok: false, error: 'Already handled' }, { status: 409 });
    await logAdmin('listing.report.resolve', { id, status: body.status, note });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/listing-reports] update error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
