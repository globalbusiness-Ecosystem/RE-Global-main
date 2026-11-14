import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { parseApplication } from '@/lib/partners';
import { applyPartner } from '@/lib/partners-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

// A signed-in user asks to become a partner (broker, developer, investor or sales). The admin reviews it.
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ error: 'Not authenticated' }, { status, headers: HEADERS });
  }
  const limited = await rateLimited('partners-apply', user.uid, 5, 60 * 60 * 1000);
  if (limited) return limited;
  const parsed = parseApplication(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: 'invalid', field: parsed.error }, { status: 400, headers: HEADERS });
  try {
    const r = await applyPartner(user.uid, user.username, parsed.value);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: HEADERS });
    return NextResponse.json({ ok: true }, { headers: HEADERS });
  } catch (err) {
    console.error('[partners/apply] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
