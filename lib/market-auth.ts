import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError, type AuthenticatedPiUser } from '@/lib/pi-auth';

// The signed-in Pi user (proven by their access token), or a ready-made 401/…
export async function requireUser(req: NextRequest): Promise<AuthenticatedPiUser | NextResponse> {
  try {
    return await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: { 'Cache-Control': 'no-store' } });
  }
}
