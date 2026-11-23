import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { cleanRetention } from '@/lib/kyc-retention';
import { getRetention, setRetention, dueUids, runKycRetention, purgeKyc, setHold } from '@/lib/kyc-retention-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// Full admin control of identity-data retention: the policy, a preview of what is due, deleting now, deleting one person, legal hold.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const policy = await getRetention();
  return NextResponse.json({ ok: true, policy, due: (await dueUids(policy)).length }, { headers: H });
}

// { years, autoDelete }
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const policy = cleanRetention(b);
  try {
    await setRetention(policy);
    await logAdmin('kyc.retention.policy', { ...policy });
    return NextResponse.json({ ok: true, policy, due: (await dueUids(policy)).length }, { headers: H });
  } catch (err) {
    console.error('[admin/kyc-retention] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H });
  }
}

// { action: 'run', confirm: true } deletes everything due now | { action: 'purge', uid } deletes one person | { action: 'hold', uid, hold: boolean }
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const uid = typeof b?.uid === 'string' ? b.uid : '';
  try {
    if (b?.action === 'run' && b.confirm === true) return NextResponse.json({ ok: true, ...(await runKycRetention('admin')) }, { headers: H });
    if (b?.action === 'purge' && uid && b.confirm === true) {
      const r = await purgeKyc(uid, 'admin');
      return NextResponse.json({ ok: r === 'purged', result: r }, { status: r === 'purged' ? 200 : r === 'hold' ? 409 : 404, headers: H });
    }
    if (b?.action === 'hold' && uid && typeof b.hold === 'boolean') {
      const ok = await setHold(uid, b.hold);
      return NextResponse.json({ ok }, { status: ok ? 200 : 404, headers: H });
    }
    return NextResponse.json({ ok: false, error: 'Invalid' }, { status: 400, headers: H });
  } catch (err) {
    console.error('[admin/kyc-retention] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H });
  }
}
