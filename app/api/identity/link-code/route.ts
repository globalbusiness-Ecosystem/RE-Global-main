import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { createLinkCode } from '@/lib/person-store';
import { markPiVerified } from '@/lib/pi-verified';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// A short one-time code (10 minutes). Typing it in another signed-in account links the two.
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'identity-code', limit: 6, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  try {
    await markPiVerified(user.uid, user.username);
    return NextResponse.json(await createLinkCode(user.uid, user.username), { headers: H });
  } catch (err) {
    console.error('[identity/link-code] error:', err);
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
