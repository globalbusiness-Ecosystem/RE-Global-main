import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { guardApi } from '@/lib/api-guard';
import { verifyPiAccessToken } from '@/lib/pi-auth';
import { getFounder, getFounderUid } from '@/lib/founder-server';
import { parseFounder, parseLinkedIn } from '@/lib/founder';
import { parseLogoUrl } from '@/lib/branding';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const bad = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });

// The account id of whoever is signed in on this browser, if any (the admin panel is opened from the same app).
async function myUid(req: NextRequest): Promise<string | null> {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (!token) return null;
  try { return (await verifyPiAccessToken(token)).uid; } catch { return null; }
}

async function view(req: NextRequest) {
  const [founder, uid, me] = await Promise.all([getFounder(), getFounderUid(), myUid(req)]);
  return { ok: true, ...founder, linked: !!uid, linkedToMe: !!uid && !!me && uid === me, signedIn: !!me };
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json(await view(req), { headers: { 'Cache-Control': 'no-store' } });
}

// Profile fields (all optional, empty removes) and/or { linkMe: true | false }.
// Linking needs the admin cookie AND a signed-in account, and it can only link the caller's own account.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return bad('Invalid request');

  let did = 0;
  try {
    if ('linkMe' in body) {
      if (typeof body.linkMe !== 'boolean') return bad('linkMe must be true or false');
      if (body.linkMe) {
        const user = await guardApi(req, { scope: 'founder-link', limit: 10 });
        if (user instanceof NextResponse) return NextResponse.json({ ok: false, error: 'سجّل الدخول في التطبيق من نفس المتصفح الأول' }, { status: 401 });
        await adminDb.collection('settings').doc('founderAccount').set({ uid: user.uid, updatedAt: Timestamp.now() });
        await logAdmin('founder.link', { linked: true });
      } else {
        await adminDb.collection('settings').doc('founderAccount').delete();
        await logAdmin('founder.link', { linked: false });
      }
      did += 1;
    }
    const profileKeys = ['enabled', 'name', 'photoUrl', 'role', 'bio', 'quote', 'linkedin', 'website'].filter((k) => k in body);
    if (profileKeys.length > 0) {
      if ('photoUrl' in body && body.photoUrl && !parseLogoUrl(body.photoUrl)) return bad('photoUrl must be an https image address');
      if ('linkedin' in body && body.linkedin && !parseLinkedIn(body.linkedin)) return bad('linkedin must be a https://…linkedin.com address');
      if ('website' in body && body.website && !parseLogoUrl(body.website)) return bad('website must start with https://');
      if ('enabled' in body && typeof body.enabled !== 'boolean') return bad('enabled must be true or false');
      const merged = parseFounder({ ...(await getFounder()), ...Object.fromEntries(profileKeys.map((k) => [k, body[k] === '' ? null : body[k]])) });
      await adminDb.collection('settings').doc('founder').set({ ...merged, updatedAt: Timestamp.now() });
      await logAdmin('founder.update', { fields: profileKeys });
      did += 1;
    }
    if (did === 0) return bad('Nothing to save');
    return NextResponse.json(await view(req));
  } catch (err) {
    console.error('[admin/founder] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
