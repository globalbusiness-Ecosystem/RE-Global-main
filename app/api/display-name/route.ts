import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { claimDisplayName, getDisplayName } from '@/lib/display-name-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// The signed-in person's chosen display name (null when none) and when they may change it next.
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'name-get', limit: 60 });
  if (user instanceof NextResponse) return user;
  try {
    return NextResponse.json(await getDisplayName(user.uid), { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}

// { name } - chooses or changes the display name. Names are unique; a change is allowed once every 7 days.
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'name-set', limit: 15, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  try {
    const r = await claimDisplayName(user.uid, body?.name);
    if (!r.ok) return NextResponse.json({ error: r.error, nextChangeAt: r.nextChangeAt ?? null }, { status: r.error === 'invalid' ? 400 : 409, headers: H });
    return NextResponse.json({ ok: true, name: r.name }, { headers: H });
  } catch (err) {
    console.error('[display-name] error:', err);
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
