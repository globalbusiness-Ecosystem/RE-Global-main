import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';

export const dynamic = 'force-dynamic';

// The signed-in user's purchased properties (proven by their Pi access token).
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401 });
  }
  try {
    const snap = await adminDb.collection('ownerships').where('uid', '==', user.uid).get();
    const items = snap.docs
      .map((d) => {
        const { uid: _uid, createdAt, ...rest } = d.data() as Record<string, any>;
        void _uid;
        return { id: d.id, ...rest, createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : null };
      })
      .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const bsnap = await adminDb.collection('bookings').where('uid', '==', user.uid).get();
    const bookings = bsnap.docs
      .map((d) => {
        const { uid: _u, createdAt, ...rest } = d.data() as Record<string, any>;
        void _u;
        return { id: d.id, ...rest, createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : null };
      })
      .sort((a: any, b: any) => String(b.start).localeCompare(String(a.start)));
    const hsnap = await adminDb.collection('share_holdings').where('uid', '==', user.uid).get();
    const holdings = hsnap.docs
      .map((d) => {
        const { uid: _h, createdAt, ...rest } = d.data() as Record<string, any>;
        void _h;
        return { id: d.id, ...rest, createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : null };
      })
      .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    // Money the platform owes this user (refunds and resale proceeds), paid by the admin by hand.
    const psnap = await adminDb.collection('payouts').where('uid', '==', user.uid).get();
    const payouts = psnap.docs
      .map((d) => {
        const x = d.data() as Record<string, any>;
        return { id: d.id, kind: x.kind, amount: Number(x.amount) || 0, status: x.status, createdAt: x.createdAt?.toDate ? x.createdAt.toDate().toISOString() : null };
      })
      .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return NextResponse.json({ items, bookings, holdings, payouts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[my-properties] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
