import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { setContractName } from '@/lib/kyc-store';
import { needsKyc } from '@/lib/kyc-rules';
import { parseNameMode } from '@/lib/contract-identity';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// The person chooses how they are named in their future contracts: account name + invite code, or their legal name.
// Contracts already signed never change (their fingerprint is fixed).
export async function POST(req: NextRequest) {
  const user = await guardApi(req, { scope: 'kyc-contract-name', limit: 20, windowMs: 60 * 60 * 1000 });
  if (user instanceof NextResponse) return user;
  if (!needsKyc(user.uid)) return NextResponse.json({ error: 'Not needed' }, { status: 400, headers: H });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (body?.contractName !== 'real' && body?.contractName !== 'alias') return NextResponse.json({ error: 'Invalid' }, { status: 400, headers: H });
  try {
    await setContractName(user.uid, parseNameMode(body.contractName));
    return NextResponse.json({ ok: true }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
