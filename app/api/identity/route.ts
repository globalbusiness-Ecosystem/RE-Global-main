import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { accountKind, MAX_LINKED_ACCOUNTS, primaryOf } from '@/lib/person-link';
import { getPerson, unlinkAccount } from '@/lib/person-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// The accounts linked to this person (names only, never ids).
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'identity-get', limit: 60 });
  if (user instanceof NextResponse) return user;
  try {
    const p = await getPerson(user.uid);
    const accounts = p ? p.accounts : [{ uid: user.uid, username: user.username }];
    const primary = p ? primaryOf(p.accounts, p.primaryUid) : null;
    return NextResponse.json({
      linked: !!p,
      max: MAX_LINKED_ACCOUNTS,
      accounts: accounts.map((a) => ({ username: a.username, kind: accountKind(a.uid), isMe: a.uid === user.uid, isPrimary: primary ? a.uid === primary.uid : false })),
    }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}

// This account leaves the link.
export async function DELETE(req: NextRequest) {
  const user = await guardApi(req, { scope: 'identity-unlink', limit: 10, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  try {
    return NextResponse.json({ ok: await unlinkAccount(user.uid) }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
