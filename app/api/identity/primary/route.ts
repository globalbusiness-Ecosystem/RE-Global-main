import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { setPrimary } from '@/lib/person-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// Makes this account the main one of its linked person: its invite code is the one the person shares.
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'identity-primary', limit: 10, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  try {
    const ok = await setPrimary(user.uid);
    return NextResponse.json({ ok }, { status: ok ? 200 : 409, headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
