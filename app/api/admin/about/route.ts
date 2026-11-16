import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getAbout } from '@/lib/about-server';
import { parseEmail, parseWhatsapp } from '@/lib/about-settings';
import { parseLogoUrl } from '@/lib/branding';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const bad = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, ...(await getAbout()) }, { headers: { 'Cache-Control': 'no-store' } });
}

// { coverUrl?, website?, email?, whatsapp? } - each one null/empty removes it. Only the given fields change.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return bad('Invalid request');
  const update: Record<string, string | null> = {};
  const empty = (v: unknown) => v === null || v === '';
  if ('coverUrl' in body) { if (empty(body.coverUrl)) update.coverUrl = null; else { const u = parseLogoUrl(body.coverUrl); if (!u) return bad('coverUrl must be an https image address'); update.coverUrl = u; } }
  if ('website' in body) { if (empty(body.website)) update.website = null; else { const u = parseLogoUrl(body.website); if (!u) return bad('website must start with https://'); update.website = u; } }
  if ('email' in body) { if (empty(body.email)) update.email = null; else { const e = parseEmail(body.email); if (!e) return bad('email is not valid'); update.email = e; } }
  if ('whatsapp' in body) { if (empty(body.whatsapp)) update.whatsapp = null; else { const w = parseWhatsapp(body.whatsapp); if (!w) return bad('whatsapp must be a number with country code'); update.whatsapp = w; } }
  if (Object.keys(update).length === 0) return bad('Nothing to save');
  try {
    await adminDb.collection('settings').doc('about').set({ ...update, updatedAt: Timestamp.now() }, { merge: true });
    await logAdmin('about.update', { fields: Object.keys(update) });
    return NextResponse.json({ ok: true, ...(await getAbout()) });
  } catch (err) {
    console.error('[admin/about] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
