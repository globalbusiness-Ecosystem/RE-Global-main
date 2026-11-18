import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { isFounderUid } from '@/lib/founder-server';

export const dynamic = 'force-dynamic';

// Signed-in person: is this account the founder? A yes/no only.
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'founder-me', limit: 60 });
  if (user instanceof NextResponse) return user;
  return NextResponse.json({ isFounder: await isFounderUid(user.uid) }, { headers: { 'Cache-Control': 'no-store' } });
}
