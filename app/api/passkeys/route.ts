import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { deletePasskey, listPasskeys } from '@/lib/passkeys-server';
import { isCredentialId } from '@/lib/passkeys';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

async function auth(req: NextRequest) {
  try {
    return { user: await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')) };
  } catch (err) {
    return { res: NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: HEADERS }) };
  }
}

// The signed-in person's own passkeys (names and dates only, never key material).
export async function GET(req: NextRequest) {
  const a = await auth(req);
  if (!a.user) return a.res;
  const limited = await rateLimited('passkeys-read', a.user.uid, 60, 60 * 1000);
  if (limited) return limited;
  try {
    return NextResponse.json({ passkeys: await listPasskeys(a.user.uid) }, { headers: HEADERS });
  } catch (err) {
    console.error('[passkeys] list error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}

// ?id=: removes one of the person's own passkeys.
export async function DELETE(req: NextRequest) {
  const a = await auth(req);
  if (!a.user) return a.res;
  const limited = await rateLimited('passkeys-write', a.user.uid, 30, 60 * 60 * 1000);
  if (limited) return limited;
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!isCredentialId(id)) return NextResponse.json({ error: 'Bad request' }, { status: 400, headers: HEADERS });
  try {
    return (await deletePasskey(a.user.uid, id))
      ? NextResponse.json({ ok: true }, { headers: HEADERS })
      : NextResponse.json({ error: 'not_found' }, { status: 404, headers: HEADERS });
  } catch (err) {
    console.error('[passkeys] delete error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
