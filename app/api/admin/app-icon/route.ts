import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getAppIcon } from '@/lib/app-icon-server';
import { parseAppIcon } from '@/lib/app-icon';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, ...(await getAppIcon()) }, { headers: { 'Cache-Control': 'no-store' } });
}

// { icon192, icon512, maskable512, apple180: https urls (all four, or all null for the built-in icons), themeColor: "#rrggbb" }
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  const next = parseAppIcon(body);
  const sent = [body.icon192, body.icon512, body.maskable512, body.apple180].filter((x) => x !== null && x !== undefined && x !== '');
  if (sent.length > 0 && next.icon192 === null) {
    return NextResponse.json({ ok: false, error: 'All four icon sizes must be https image addresses' }, { status: 400 });
  }
  try {
    const before = await getAppIcon();
    await adminDb.collection('settings').doc('appIcon').set({ ...next, updatedAt: Timestamp.now() });
    await logAdmin('appIcon.update', { from: before, to: next });
    return NextResponse.json({ ok: true, ...(await getAppIcon()) });
  } catch (err) {
    console.error('[admin/app-icon] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
