import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { decideKyc, listKyc } from '@/lib/kyc-store';
import { cleanNote } from '@/lib/kyc-rules';
import { notifyKycDecision } from '@/lib/kyc-notify';
import { deleteKycFiles } from '@/lib/kyc-files-store';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// Verification requests of people who signed in outside the Pi Browser.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const s = req.nextUrl.searchParams.get('status');
    const status = s === 'pending' || s === 'approved' || s === 'rejected' ? s : undefined;
    return NextResponse.json({ ok: true, requests: await listKyc(status) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/kyc] read error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// { uid, decision: 'approved' | 'rejected', reason? } — a rejection needs a reason the person will see.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => null);
  const uid = typeof b?.uid === 'string' ? b.uid : '';
  const decision = b?.decision === 'approved' || b?.decision === 'rejected' ? b.decision : null;
  const reason = cleanNote(b?.reason);
  if (!uid.startsWith('web_') || !decision || (decision === 'rejected' && !reason)) return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  try {
    const r = await decideKyc(uid, decision, reason);
    if (r === 404) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (r === 409) return NextResponse.json({ ok: false, error: 'This request cannot move to that status' }, { status: 409 });
    // A rejected person sends fresh photos with the next request, so the old ones are not kept.
    if (decision === 'rejected') await deleteKycFiles(uid).catch(() => {});
    await logAdmin(`kyc.${decision}`, { uid, reason });
    const mailed = await notifyKycDecision(uid, decision, reason);
    return NextResponse.json({ ok: true, mailed });
  } catch (err) {
    console.error('[admin/kyc] update error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
