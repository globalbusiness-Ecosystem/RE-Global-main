import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';

export const dynamic = 'force-dynamic';

// Exchanges a verified Pi access token for a Firebase custom token, so
// Firestore security rules can tell WHO is calling (request.auth.token.username).
export async function POST(req: NextRequest) {
  let user;
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    user = await verifyPiAccessToken(token);
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: 'Not authenticated' }, { status });
  }

  try {
    const token = await adminAuth.createCustomToken(user.uid, { username: user.username });
    return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[auth/firebase-token] error:', err);
    return NextResponse.json({ error: 'Could not create session' }, { status: 500 });
  }
}
