import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { claimHandle, getHandle } from '@/lib/handle-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// The username a web account chose (also its invite code).
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'handle-get', limit: 60 });
  if (user instanceof NextResponse) return user;
  try {
    const h = await getHandle(user.username);
    return NextResponse.json({ handle: h?.handle ?? null, code: h?.code ?? null }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}

// { handle } - chooses the username, once. It becomes the invite code too.
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'handle-set', limit: 15, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  try {
    const r = await claimHandle(user.uid, user.username, body?.handle);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.error === 'taken' || r.error === 'already' ? 409 : 400, headers: H });
    return NextResponse.json({ ok: true, handle: r.handle, code: r.code }, { headers: H });
  } catch (err) {
    console.error('[handle] error:', err);
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
