import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { forgetBan, validUsername } from '@/lib/ban-list';
import { logAdmin } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// Users = everyone with a profile, anyone who signed a contract, and anyone banned.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const [profiles, contracts, banned] = await Promise.all([
      adminDb.collection('profiles').select('emailVerified', 'verifiedEmail').limit(2000).get(),
      adminDb.collection('contracts').select('buyerUsername', 'amount', 'createdAt').limit(5000).get(),
      adminDb.collection('banned_users').get(),
    ]);

    const users = new Map<string, any>();
    const ensure = (u: string) => {
      let r = users.get(u);
      if (!r) users.set(u, (r = { username: u, emailVerified: false, email: '', contracts: 0, spent: 0, lastActivity: null, banned: false, banReason: '' }));
      return r;
    };
    profiles.docs.forEach((d) => {
      const p = d.data();
      const r = ensure(d.id);
      r.emailVerified = p.emailVerified === true;
      r.email = typeof p.verifiedEmail === 'string' ? p.verifiedEmail : '';
    });
    contracts.docs.forEach((d) => {
      const c = d.data();
      if (typeof c.buyerUsername !== 'string' || !c.buyerUsername) return;
      const r = ensure(c.buyerUsername);
      r.contracts++;
      r.spent += Number(c.amount) || 0;
      const at: string | null = c.createdAt?.toDate?.().toISOString() ?? null;
      if (at && (!r.lastActivity || at > r.lastActivity)) r.lastActivity = at;
    });
    banned.docs.forEach((d) => {
      const r = ensure(d.id);
      r.banned = true;
      r.banReason = String(d.data().reason || '');
    });

    const list = [...users.values()].sort((a, b) => Number(b.banned) - Number(a.banned) || b.contracts - a.contracts || a.username.localeCompare(b.username));
    return NextResponse.json({ ok: true, users: list }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/users] list error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { username, banned: boolean, reason? }
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => null);
  if (!b || !validUsername(b.username) || typeof b.banned !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  const reason = typeof b.reason === 'string' ? b.reason.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 300) : '';
  try {
    const ref = adminDb.collection('banned_users').doc(b.username);
    if (b.banned) await ref.set({ reason, bannedAt: Timestamp.now() });
    else await ref.delete();
    forgetBan(b.username);
    await logAdmin(b.banned ? 'user.ban' : 'user.unban', { username: b.username, reason });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/users] ban error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
