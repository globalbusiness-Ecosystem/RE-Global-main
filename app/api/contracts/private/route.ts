import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { personAccounts } from '@/lib/person-store';
import { privateForOwner } from '@/lib/contract-private-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// The full identity details of a contract (legal name, ID number, phone), visible only to the contract's owner.
// "Owner" = any account of the same person (linked accounts). Everyone else gets a plain 403/404.
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'contract-private', limit: 30, windowMs: 10 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return NextResponse.json({ error: 'Invalid' }, { status: 400, headers: H });
  try {
    const uids = (await personAccounts(user.uid, user.username)).map((a) => a.uid);
    const r = await privateForOwner(id, uids);
    if (!r.ok) return NextResponse.json({ error: r.status === 404 ? 'No private details' : 'Not allowed' }, { status: r.status, headers: H });
    const { ok: _ok, ...data } = r;
    return NextResponse.json(data, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
