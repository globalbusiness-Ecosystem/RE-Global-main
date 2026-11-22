import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, adminWho } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { cleanIncident, cleanRequest } from '@/lib/compliance';
import { listRegister, createIncident, createRequest, updateEntry } from '@/lib/compliance-store';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const bad = () => NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400, headers: H });

// The compliance register (security incidents and privacy requests). There is no DELETE on purpose: entries are only moved forward and annotated.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try { return NextResponse.json({ ok: true, ...(await listRegister()) }, { headers: H }); }
  catch (err) { console.error('[admin/compliance-register] read error:', err); return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H }); }
}

// { type: 'incident', title, description?, severity, personalData?, discoveredAt? } | { type: 'request', kind, requester, note?, receivedAt? }
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const who = await adminWho(req);
  if (!who) return unauthorized();
  const b = await req.json().catch(() => null);
  try {
    if (b?.type === 'incident') {
      const i = cleanIncident(b); if (!i) return bad();
      const id = await createIncident(i, who.sub);
      await logAdmin('compliance.incident.create', { id, severity: i.severity, personalData: i.personalData, by: who.sub });
      return NextResponse.json({ ok: true, id }, { headers: H });
    }
    if (b?.type === 'request') {
      const r = cleanRequest(b); if (!r) return bad();
      const id = await createRequest(r, who.sub);
      await logAdmin('compliance.request.create', { id, kind: r.kind, by: who.sub });
      return NextResponse.json({ ok: true, id }, { headers: H });
    }
    return bad();
  } catch (err) { console.error('[admin/compliance-register] create error:', err); return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H }); }
}

// { type, id, status?, note? }
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const who = await adminWho(req);
  if (!who) return unauthorized();
  const b = await req.json().catch(() => null);
  if ((b?.type !== 'incident' && b?.type !== 'request') || typeof b?.id !== 'string') return bad();
  try {
    if (!(await updateEntry(b.type, b.id, { status: b.status, note: b.note }, who.sub))) return NextResponse.json({ ok: false, error: 'Not found or invalid' }, { status: 404, headers: H });
    await logAdmin(`compliance.${b.type}.update`, { id: b.id, status: b.status ?? null, by: who.sub });
    return NextResponse.json({ ok: true }, { headers: H });
  } catch (err) { console.error('[admin/compliance-register] update error:', err); return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500, headers: H }); }
}
