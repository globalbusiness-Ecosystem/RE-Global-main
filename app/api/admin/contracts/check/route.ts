import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { checkPlatformAccount } from '@/lib/chain-check';

export const dynamic = 'force-dynamic';

// Looks at the platform's blockchain account (exists? funded? same key as the one in settings?). Returns a short code and the public key only.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true, ...(await checkPlatformAccount()) }, { headers: { 'Cache-Control': 'no-store' } });
}
