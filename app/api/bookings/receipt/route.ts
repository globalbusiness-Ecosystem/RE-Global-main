import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { guestReceiptData } from '@/lib/receipt-server';
import { buildReceiptHtml } from '@/lib/receipt';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'no-store' };

// ?bookingId=...&lang=en -> the printable receipt (HTML) of the signed-in guest's confirmed stay.
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: NO_STORE });
  }
  const limited = await rateLimited('receipt', user.uid, 30, 10 * 60 * 1000);
  if (limited) return limited;
  const lang = req.nextUrl.searchParams.get('lang') ?? 'en';
  try {
    const r = await guestReceiptData(user.uid, req.nextUrl.searchParams.get('bookingId'), lang);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: NO_STORE });
    return new NextResponse(buildReceiptHtml(lang, r.data), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
        'X-Content-Type-Options': 'nosniff',
        ...NO_STORE,
      },
    });
  } catch (err) {
    console.error('[bookings/receipt] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: NO_STORE });
  }
}
