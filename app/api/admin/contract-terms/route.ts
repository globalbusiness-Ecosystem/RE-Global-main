import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { CLAUSES, FRAMEWORK_KINDS, previewFrameworkTerms, type FrameworkKind, type FrameworkParams } from '@/lib/contract-framework';
import { DISABLEABLE_IDS, EDITABLE_IDS, LOCKED_IDS, MAX_CUSTOM, MAX_TEXT, VARIABLES, hasOverrides, parseStored, validateDraft, type TermsDraft } from '@/lib/contract-terms';

export const dynamic = 'force-dynamic';

const HEADERS = { 'Cache-Control': 'no-store' };
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: HEADERS });
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

const termsRef = () => adminDb.collection('settings').doc('contractTerms');
const historyRef = () => adminDb.collection('contract_terms_history');

const SAMPLE = (kind: FrameworkKind): FrameworkParams => ({
  kind, rail: 'pi', governingLaw: 'the laws of the selected country', currency: 'Pi', amount: 100, paymentId: 'PAYMENT-ID', txid: 'TRANSACTION-ID', hasInspection: true, shariah: true,
  resale: { fee: 2, proceeds: 98 },
});

// The clause list for the editor: built-in text, and whether the admin may change or switch it off.
function catalog() {
  return CLAUSES.map((c) => {
    const kinds = c.kinds === 'all' ? FRAMEWORK_KINDS : c.kinds;
    return { id: c.id, title: c.title, kinds, locked: LOCKED_IDS.includes(c.id), editable: EDITABLE_IDS.includes(c.id), disableable: DISABLEABLE_IDS.includes(c.id), text: c.body(SAMPLE(kinds[0])) };
  });
}

async function history() {
  const snap = await historyRef().orderBy('revision', 'desc').limit(20).get();
  return snap.docs.map((d) => {
    const x = d.data();
    return { revision: Number(x.revision) || 0, savedAt: String(x.savedAt ?? ''), note: String(x.note ?? ''), edits: Object.keys(x.clauses ?? {}).length + (Array.isArray(x.custom) ? x.custom.length : 0) };
  });
}

// Publishes a draft as the next revision and keeps a copy in the history. Contracts already signed are never touched.
async function publish(draft: TermsDraft, note: string): Promise<number> {
  const ref = termsRef();
  const savedAt = new Date().toISOString();
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    const revision = (s.exists ? Math.floor(Number(s.data()?.revision)) || 0 : 0) + 1;
    tx.set(ref, { revision, clauses: draft.clauses, custom: draft.custom, updatedAt: Timestamp.now() });
    tx.set(historyRef().doc(String(revision).padStart(6, '0')), { revision, clauses: draft.clauses, custom: draft.custom, savedAt, note });
    return revision;
  });
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const snap = await termsRef().get();
    const current = snap.exists ? parseStored(snap.data()) : undefined;
    return NextResponse.json({
      ok: true, revision: snap.exists ? Math.floor(Number(snap.data()?.revision)) || 0 : 0,
      current: current ? { clauses: current.clauses, custom: current.custom } : { clauses: {}, custom: [] },
      catalog: catalog(), history: await history(), variables: VARIABLES, limits: { maxText: MAX_TEXT, maxCustom: MAX_CUSTOM }, kinds: FRAMEWORK_KINDS,
    }, { headers: HEADERS });
  } catch (err) {
    console.error('[admin/contract-terms] read error:', err);
    return bad('Server error', 500);
  }
}

// { action: 'preview', kind, clauses, custom } -> the terms as they would print, nothing saved
// { action: 'save', clauses, custom, note } -> next revision
// { action: 'rollback', revision } -> a copy of that old revision becomes the next revision
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return bad('Invalid request');
  try {
    if (body.action === 'rollback') {
      const n = Math.floor(Number(body.revision));
      if (!(n > 0)) return bad('Invalid revision');
      const old = await historyRef().doc(String(n).padStart(6, '0')).get();
      if (!old.exists) return bad('Revision not found', 404);
      const v = validateDraft(old.data());
      if (!v.ok) return bad('That revision no longer passes the rules');
      const revision = await publish(v.value, `rollback to r${n}`);
      await logAdmin('contract.terms', { revision, note: `rollback to r${n}` });
      return NextResponse.json({ ok: true, revision }, { headers: HEADERS });
    }
    const v = validateDraft(body);
    if (!v.ok) return NextResponse.json({ ok: false, error: v.errors.join(' | '), errors: v.errors }, { status: 400, headers: HEADERS });
    if (body.action === 'preview') {
      const kind = FRAMEWORK_KINDS.includes(body.kind) ? (body.kind as FrameworkKind) : 'sale';
      const cur = await termsRef().get();
      const next = (cur.exists ? Math.floor(Number(cur.data()?.revision)) || 0 : 0) + 1;
      const text = previewFrameworkTerms(kind, hasOverrides(v.value) ? { revision: next, ...v.value } : undefined, true);
      return NextResponse.json({ ok: true, text }, { headers: HEADERS });
    }
    if (body.action === 'save') {
      const note = String(body.note ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 120);
      const revision = await publish(v.value, note);
      await logAdmin('contract.terms', { revision, note });
      return NextResponse.json({ ok: true, revision }, { headers: HEADERS });
    }
    return bad('Unknown action');
  } catch (err) {
    console.error('[admin/contract-terms] error:', err);
    return bad('Server error', 500);
  }
}
