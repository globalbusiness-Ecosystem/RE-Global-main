import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';
import { logAdmin } from '@/lib/admin-audit';
import { adminBookings, adminCancelBooking } from '@/lib/booking-admin';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ ok: true, ...(await adminBookings()) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/bookings] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { id } cancels a booking: frees the dates and queues a refund for the guest.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  try {
    const r = await adminCancelBooking(typeof body?.id === 'string' ? body.id : '');
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
    await logAdmin('booking.cancel', { id: body.id, title: r.title, guest: r.username, refund: r.amount });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/bookings] cancel error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
