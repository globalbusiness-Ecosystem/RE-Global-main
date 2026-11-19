import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { redeemLinkCode } from '@/lib/person-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// { code } - links this account with the account that made the code. Few tries per hour, so codes cannot be guessed.
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'identity-link', limit: 10, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  try {
    const r = await redeemLinkCode(user.uid, user.username, body?.code);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.error === 'invalid' ? 400 : 409, headers: H });
    return NextResponse.json({ ok: true }, { headers: H });
  } catch (err) {
    console.error('[identity/link] error:', err);
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
