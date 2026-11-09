import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ipLimited } from '@/lib/rate-guard';
import { anchorSecret, publicOf } from '@/lib/signing-keys';
import { PI_TESTNET_HORIZON } from '@/lib/chain-anchor';
import { classifyQuery, fingerprintMatches, shapeTx, type ChainTx } from '@/lib/explorer';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

async function horizon(path: string): Promise<Response | null> {
  try { return await fetch(`${PI_TESTNET_HORIZON}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) }); } catch { return null; }
}

// What anyone may see about a contract: only its public fingerprints and title, nothing about the people or the price.
function publicContract(id: string, d: FirebaseFirestore.DocumentData) {
  return {
    id, propertyTitle: String(d.propertyTitle ?? ''), type: String(d.type ?? ''), contractHash: String(d.contractHash ?? ''),
    txid: String(d.txid ?? ''), signedAt: typeof d.signedAt === 'string' ? d.signedAt : null,
    registry: d.registry?.status === 'recorded' ? { txid: String(d.registry.txid ?? ''), entryId: d.registry.entryId ?? null } : null,
  };
}

// Public blockchain explorer. Without q: the platform's latest records. With q: a transaction hash, a contract hash or a contract number.
export async function GET(req: NextRequest) {
  const limited = await ipLimited('explorer', req, 40, 60_000);
  if (limited) return limited;
  const raw = req.nextUrl.searchParams.get('q');

  if (!raw) {
    const pub = publicOf(anchorSecret());
    if (!pub) return NextResponse.json({ recent: [] }, { headers: H });
    const r = await horizon(`/accounts/${pub}/transactions?order=desc&limit=8`);
    if (!r || !r.ok) return NextResponse.json({ recent: [] }, { headers: H });
    const recs: unknown[] = (await r.json().catch(() => null))?._embedded?.records ?? [];
    const recent = recs.map(shapeTx).filter((t): t is ChainTx => !!t && !!t.memoHex);
    return NextResponse.json({ recent }, { headers: H });
  }

  const { kind, q } = classifyQuery(raw);
  if (kind === 'invalid') return NextResponse.json({ error: 'invalid' }, { status: 400, headers: H });

  try {
    const col = adminDb.collection('contracts');
    let doc: { id: string; data: FirebaseFirestore.DocumentData } | null = null;
    if (kind === 'id') {
      const s = await col.doc(q).get();
      if (s.exists) doc = { id: s.id, data: s.data()! };
    } else {
      for (const field of ['txid', 'contractHash']) {
        const s = await col.where(field, '==', q).limit(1).get();
        if (!s.empty) { doc = { id: s.docs[0].id, data: s.docs[0].data() }; break; }
      }
    }
    const contract = doc ? publicContract(doc.id, doc.data) : null;
    const txHash = kind === 'hash' ? (contract?.txid || q) : contract?.txid || '';

    let tx: ChainTx | null = null;
    let unreachable = false;
    if (txHash) {
      const r = await horizon(`/transactions/${txHash}`);
      if (!r) unreachable = true;
      else if (r.ok) tx = shapeTx(await r.json().catch(() => null));
      else if (r.status !== 404) unreachable = true;
    }
    if (!contract && !tx) return NextResponse.json({ error: unreachable ? 'unreachable' : 'not_found' }, { status: unreachable ? 502 : 404, headers: H });
    return NextResponse.json({ contract, tx, matches: !!tx && !!contract && fingerprintMatches(tx.memoHex, contract.contractHash) }, { headers: H });
  } catch {
    return NextResponse.json({ error: 'unreachable' }, { status: 502, headers: H });
  }
}
