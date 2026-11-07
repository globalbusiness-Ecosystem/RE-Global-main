import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { getKyc } from '@/lib/kyc-store';
import { needsKyc } from '@/lib/kyc-rules';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// Whether this person must verify their identity, and where their verification stands.
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'kyc-me', limit: 60 });
  if (user instanceof NextResponse) return user;
  const required = needsKyc(user.uid);
  if (!required) return NextResponse.json({ required, status: 'approved' }, { headers: H });
  try {
    const k = await getKyc(user.uid);
    return NextResponse.json({ required, status: k.status, rejectReason: k.rejectReason ?? null }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
