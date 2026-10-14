import { NextRequest, NextResponse } from 'next/server';
import { authorizePayment, piPaymentAction } from '@/lib/pi-payment-guard';
import { releaseReservation } from '@/lib/property-reserve';
import { releaseBooking } from '@/lib/booking-calendar';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ctx = await authorizePayment(req, body?.paymentId);
  if (ctx instanceof NextResponse) return ctx;
  // Free the property if this buyer was holding it (never blocks the cancel itself).
  try {
    await releaseReservation(String(ctx.payment.metadata?.propertyId ?? ''), ctx.user.uid);
    await releaseBooking(String(ctx.payment.metadata?.propertyId ?? ''), ctx.paymentId);
  } catch (e) {
    console.error('[payments/cancel] release failed:', e);
  }
  return piPaymentAction(ctx.paymentId, 'cancel');
}
