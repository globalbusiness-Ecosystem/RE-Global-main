import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { adminBlockDates, adminListBlocks, adminUnblockDates } from '@/lib/booking-admin';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const serverError = () => NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
const NO_STORE = { 'Cache-Control': 'no-store' };

// ?propertyId=... -> the closed dates of that listing.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const blocks = await adminListBlocks(req.nextUrl.searchParams.get('propertyId') ?? '');
    return NextResponse.json({ ok: true, blocks }, { headers: NO_STORE });
  } catch (err) {
    console.error('[admin/blocks] list error:', err);
    return serverError();
  }
}

// { propertyId, start, end, note? } closes dates.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => null);
  try {
    const r = await adminBlockDates(typeof b?.propertyId === 'string' ? b.propertyId : '', b);
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
    await logAdmin('booking.block', { id: b.propertyId, title: r.title, start: r.start, end: r.end, note: typeof b.note === 'string' ? b.note.slice(0, 80) : '' });
    return NextResponse.json({ ok: true, id: r.id });
  } catch (err) {
    console.error('[admin/blocks] block error:', err);
    return serverError();
  }
}

// ?propertyId=...&id=... opens closed dates again.
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const propertyId = req.nextUrl.searchParams.get('propertyId') ?? '';
  const id = req.nextUrl.searchParams.get('id') ?? '';
  try {
    const r = await adminUnblockDates(propertyId, id);
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
    await logAdmin('booking.unblock', { id: propertyId, start: r.start, end: r.end });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/blocks] unblock error:', err);
    return serverError();
  }
}
