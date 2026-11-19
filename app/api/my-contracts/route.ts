import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { guardApi } from '@/lib/api-guard';
import { serializeValue } from '@/lib/backup';
import { personAccounts } from '@/lib/person-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const PER_QUERY = 200;

// The contracts of this person: as buyer or seller, under every account linked to them (a contract made in the
// Pi Browser also shows up in the web account once the two are linked).
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'my-contracts', limit: 60 });
  if (user instanceof NextResponse) return user;
  try {
    const accounts = await personAccounts(user.uid, user.username);
    const names = Array.from(new Set(accounts.map((a) => a.username).filter((n) => n && !n.includes('/'))));
    const snaps = await Promise.all(names.flatMap((n) => [
      adminDb.collection('contracts').where('buyerUsername', '==', n).limit(PER_QUERY).get(),
      adminDb.collection('contracts').where('sellerUsername', '==', n).limit(PER_QUERY).get(),
    ]));
    const byId = new Map<string, Record<string, unknown>>();
    for (const s of snaps) for (const d of s.docs) byId.set(d.id, { id: d.id, ...(serializeValue(d.data()) as Record<string, unknown>) });
    return NextResponse.json({ contracts: Array.from(byId.values()) }, { headers: H });
  } catch (err) {
    console.error('[my-contracts] error:', err);
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
