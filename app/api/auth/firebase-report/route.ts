import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';

export const dynamic = 'force-dynamic';

// Diagnostic: lets a signed-in client report why Firebase sign-in failed.
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const user = await verifyPiAccessToken(token);
    const body = await req.json().catch(() => ({}));
    const msg = String(body?.message ?? '').slice(0, 400);
    console.error('[firebase-report]', user.username, msg);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: 'Not authenticated' }, { status });
  }
}
