import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getKycFile } from '@/lib/kyc-files-store';
import { isFileKind } from '@/lib/kyc-files';

export const dynamic = 'force-dynamic';

// The team opens one identity photo (?uid=web_...&kind=front|back|selfie). Every view is written to the admin log.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const uid = req.nextUrl.searchParams.get('uid') ?? '';
  const kind = req.nextUrl.searchParams.get('kind');
  if (!uid.startsWith('web_') || !isFileKind(kind)) return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  try {
    const f = await getKycFile(uid, kind);
    if (!f) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    await logAdmin('kyc.view-file', { uid, kind });
    return new NextResponse(new Uint8Array(f.bytes), {
      headers: { 'Content-Type': f.mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' },
    });
  } catch (err) {
    console.error('[admin/kyc/file] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
