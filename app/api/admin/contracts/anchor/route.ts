import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { adminDb } from '@/lib/firebase-admin';
import { repairPlatformKeys } from '@/lib/signing-keys';
import { anchorContract, createMissingCardContracts, recordContract } from '@/lib/card-contract';

export const dynamic = 'force-dynamic';

// Tries again to put the fingerprint of card contracts on the blockchain (up to 10 per call). Safe to repeat.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    // Paid card orders that never got a contract come first (paid before contracts existed, or while signing was off).
    const made = await createMissingCardContracts(10);
    const keysRepaired = await repairPlatformKeys().catch(() => 0);
    const col = adminDb.collection('signed_contracts');
    const [a, b] = await Promise.all([
      col.where('paymentMethod', '==', 'card').where('txid', '==', '').limit(10).get(),
      col.where('paymentMethod', '==', 'card').where('registryPending', '==', true).limit(10).get(),
    ]);
    const ids = [...new Set([...a.docs, ...b.docs].map((d) => d.id))].slice(0, 10);
    const out = { created: made.created, createdFailed: made.failed, anchored: 0, recorded: 0, failed: 0, total: ids.length, errors: [] as string[], keysRepaired };
    // Short error codes of the attempts that failed (never a secret), so the panel can say what to fix.
    const why = async (id: string, field: 'anchor' | 'registry') => {
      const e = (await col.doc(id).get()).data()?.[field]?.error;
      if (typeof e === 'string' && !out.errors.includes(`${field}:${e}`)) out.errors.push(`${field}:${e}`);
    };
    for (const id of ids) {
      const r = await anchorContract(id);
      if (r === 'anchored') out.anchored++; else if (r === 'failed' || r === 'not_configured') { out.failed++; if (r === 'failed') await why(id, 'anchor'); }
      const g = await recordContract(id);
      if (g === 'recorded') out.recorded++; else if (g === 'failed') { out.failed++; await why(id, 'registry'); }
    }
    await logAdmin('contracts.anchor', out);
    return NextResponse.json({ ok: true, ...out }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[admin/contracts/anchor] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
