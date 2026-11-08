import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { webClaimsToSet } from '@/lib/web-auth';

export const dynamic = 'force-dynamic';

// A person who signed in with Google or an e-mail link gets their name (web_...) stored on their sign-in, so the
// Firestore rules (profile, favourites, preferences) recognise them like a Pi user. The name comes from their verified
// account only; nothing in the request can choose it. Only web accounts are touched, never Pi ones.
export async function POST(req: NextRequest) {
  let user;
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    user = await verifyPiAccessToken(token);
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: 'Not authenticated' }, { status });
  }
  if (!user.uid.startsWith('web_')) return NextResponse.json({ error: 'Not a web account' }, { status: 400 });
  const limited = await rateLimited('web-claims', user.uid, 20, 10 * 60 * 1000);
  if (limited) return limited;

  const firebaseUid = user.uid.slice(4);
  try {
    const record = await adminAuth.getUser(firebaseUid);
    const next = webClaimsToSet(firebaseUid, record.customClaims as Record<string, unknown> | undefined);
    if (next) await adminAuth.setCustomUserClaims(firebaseUid, next);
    return NextResponse.json({ updated: next !== null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[auth/web-claims] error:', err);
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
