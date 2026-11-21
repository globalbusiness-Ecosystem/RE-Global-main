import { NextRequest, NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { getContractName, getKyc } from '@/lib/kyc-store';
import { needsKyc } from '@/lib/kyc-rules';
import { getKycPolicy } from '@/lib/kyc-policy';
import { ensureKycProviders } from '@/lib/kyc-provider/registry';
import { activeKycProvider } from '@/lib/kyc-provider/provider';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

// Whether this person must verify their identity, and where their verification stands.
export async function GET(req: NextRequest) {
  const user = await guardApi(req, { scope: 'kyc-me', limit: 60 });
  if (user instanceof NextResponse) return user;
  try {
    // Web sign-ins must verify; Pi accounts may, and must when the team turns the rule on for everyone.
    const web = needsKyc(user.uid);
    const required = web || (await getKycPolicy()).requireAll;
    ensureKycProviders();
    // An identity company's page is only used for web sign-ins (its callbacks are for them); Pi accounts are reviewed by the team.
    const hosted = web && activeKycProvider() !== null;
    const [k, contractName] = await Promise.all([getKyc(user.uid), getContractName(user.uid)]);
    return NextResponse.json({ required, hosted, status: k.status, rejectReason: k.rejectReason ?? null, contractName }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H });
  }
}
