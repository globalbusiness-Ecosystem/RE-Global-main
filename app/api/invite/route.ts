import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { ensureInviteCode } from '@/lib/invite-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// The caller's invite code (made on first use). The same for Pi and web accounts, and unique across both.
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'invite-get', limit: 30 });
  if (user instanceof NextResponse) return user;
  try {
    return NextResponse.json({ code: await ensureInviteCode(user.uid, user.username) }, { headers: H });
  } catch (err) {
    console.error('[invite] error:', err);
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
