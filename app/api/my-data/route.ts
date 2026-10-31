import 'server-only';
import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { serializeValue } from '@/lib/backup';
import { EXPORT_LIMIT, KEPT_NOTE, buildExport, exportFilename, isEraseConfirm, isSafeId } from '@/lib/my-data';

export const dynamic = 'force-dynamic';

const HEADERS = { 'Cache-Control': 'no-store' };

async function signedInUser(req: NextRequest) {
  try {
    const user = await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));
    return isSafeId(user.username) ? user : null;
  } catch (err) {
    if (err instanceof AuthError && err.status !== 401) throw err;
    return null;
  }
}

const rows = (snap: { docs: { id: string; data(): unknown }[] }) =>
  snap.docs.map((d) => ({ id: d.id, ...(serializeValue(d.data()) as Record<string, unknown>) }));

// Everything the platform holds about the signed-in user, as one JSON file.
export async function GET(req: NextRequest) {
  let user;
  try { user = await signedInUser(req); } catch (err) { return NextResponse.json({ error: 'Not authenticated' }, { status: (err as AuthError).status, headers: HEADERS }); }
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: HEADERS });
  const limited = await rateLimited('my-data-export', user.uid, 5, 60 * 60 * 1000);
  if (limited) return limited;
  try {
    const by = (col: string, field: string, value: string) => adminDb.collection(col).where(field, '==', value).limit(EXPORT_LIMIT).get();
    const one = async (col: string) => {
      const d = await adminDb.collection(col).doc(user.username).get();
      return d.exists ? serializeValue(d.data()) : null;
    };
    const [profile, preferences, referral, avatar, favorites, ownerships, bookings, holdings, payouts, tFrom, tTo, tBuy, cBuy, cSell, reviews] = await Promise.all([
      one('profiles'), one('preferences'), one('referrals'), one('avatars'),
      by('favorites', 'username', user.username),
      by('ownerships', 'uid', user.uid), by('bookings', 'uid', user.uid), by('share_holdings', 'uid', user.uid), by('payouts', 'uid', user.uid),
      by('share_transfers', 'fromUid', user.uid), by('share_transfers', 'toUid', user.uid), by('share_transfers', 'buyerUid', user.uid),
      by('contracts', 'buyerUsername', user.username), by('contracts', 'sellerUsername', user.username),
      by('stay_reviews', 'uid', user.uid),
    ]);
    const transfers = new Map<string, Record<string, unknown>>();
    for (const r of [...rows(tFrom), ...rows(tTo), ...rows(tBuy)]) transfers.set(r.id, r);
    const contracts = new Map<string, Record<string, unknown>>();
    for (const r of [...rows(cBuy), ...rows(cSell)]) contracts.set(r.id, r);
    const body = buildExport(user, {
      profile, preferences, referral, avatar,
      favorites: rows(favorites), ownerships: rows(ownerships), bookings: rows(bookings), share_holdings: rows(holdings),
      payouts: rows(payouts), stay_reviews: rows(reviews), share_transfers: [...transfers.values()], contracts: [...contracts.values()],
    });
    return new NextResponse(JSON.stringify(body, null, 2), {
      status: 200,
      headers: { ...HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="${exportFilename()}"` },
    });
  } catch (err) {
    console.error('[my-data] export error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}

// Deletes the personal data. Body must be {"confirm":"DELETE"}. Financial and contract records stay.
export async function DELETE(req: NextRequest) {
  let user;
  try { user = await signedInUser(req); } catch (err) { return NextResponse.json({ error: 'Not authenticated' }, { status: (err as AuthError).status, headers: HEADERS }); }
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: HEADERS });
  const limited = await rateLimited('my-data-erase', user.uid, 3, 24 * 60 * 60 * 1000);
  if (limited) return limited;
  let body: unknown = null;
  try { body = await req.json(); } catch { /* handled below */ }
  if (!isEraseConfirm(body)) return NextResponse.json({ error: 'Confirmation required' }, { status: 400, headers: HEADERS });
  try {
    const favs = await adminDb.collection('favorites').where('username', '==', user.username).limit(EXPORT_LIMIT).get();
    const batch = adminDb.batch();
    for (const col of ['profiles', 'preferences', 'referrals', 'avatars']) batch.delete(adminDb.collection(col).doc(user.username));
    for (const d of favs.docs) batch.delete(d.ref);
    await batch.commit();
    // Guest reviews stay on the listing (they are masked already) but are cut loose from the account.
    const revs = await adminDb.collection('stay_reviews').where('uid', '==', user.uid).limit(EXPORT_LIMIT).get();
    for (let i = 0; i < revs.docs.length; i += 400) {
      const b = adminDb.batch();
      for (const d of revs.docs.slice(i, i + 400)) b.update(d.ref, { uid: '' });
      await b.commit();
    }
    // A record that an erasure happened (for compliance), without the name: only a one-way hash of the user id.
    await adminDb.collection('erasure_requests').doc(createHash('sha256').update(user.uid).digest('hex')).set({ at: new Date().toISOString(), favorites: favs.docs.length, reviews: revs.docs.length });
    return NextResponse.json({ ok: true, deleted: ['profile', 'preferences', 'referral', 'avatar', 'favorites'], anonymized: ['reviews'], kept: KEPT_NOTE }, { headers: HEADERS });
  } catch (err) {
    console.error('[my-data] erase error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
