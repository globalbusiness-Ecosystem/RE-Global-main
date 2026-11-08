import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { adminDb } from '@/lib/firebase-admin';
import { anchorContract } from '@/lib/card-contract';

export const dynamic = 'force-dynamic';

// Tries again to put the fingerprint of card contracts on the blockchain (up to 10 per call). Safe to repeat.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const snap = await adminDb.collection('signed_contracts').where('paymentMethod', '==', 'card').where('txid', '==', '').limit(10).get();
    const out = { anchored: 0, failed: 0, total: snap.size };
    for (const d of snap.docs) {
      const r = await anchorContract(d.id);
      if (r === 'anchored') out.anchored++; else if (r === 'failed' || r === 'not_configured') out.failed++;
    }
    await logAdmin('contracts.anchor', out);
    return NextResponse.json({ ok: true, ...out }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/contracts/anchor] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
