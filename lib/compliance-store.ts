import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { INCIDENT_STATUS, REQUEST_STATUS, incidentClock, requestClock, incidentDeadline, requestDeadline, complianceAttention, type NewIncident, type NewRequest, type IncidentStatus, type RequestStatus, type RequestKind, type Severity } from '@/lib/compliance';

// compliance_incidents/<id> and compliance_requests/<id>. Entries are never deleted (a register that can be edited away is not evidence);
// they only move forward through their status and gather dated notes.
const inc = () => adminDb.collection('compliance_incidents');
const req = () => adminDb.collection('compliance_requests');
const okId = (id: string) => !!id && !id.includes('/') && id.length <= 60;
const ms = (v: any): number => (v?.toMillis ? v.toMillis() : 0);
type Note = { at: number; by: string; text: string };
const notesOf = (v: any): Note[] => (Array.isArray(v) ? v.map((n) => ({ at: Number(n.at) || 0, by: String(n.by ?? ''), text: String(n.text ?? '') })) : []);

export async function listRegister(now = Date.now()) {
  const [a, b] = await Promise.all([inc().limit(300).get(), req().limit(300).get()]);
  const incidents = a.docs.map((d) => { const x = d.data(); const v = { id: d.id, title: String(x.title ?? ''), description: String(x.description ?? ''), severity: x.severity as Severity, personalData: x.personalData === true, status: x.status as IncidentStatus, discoveredAtMs: ms(x.discoveredAt), notes: notesOf(x.notes) }; return { ...v, deadlineMs: v.personalData ? incidentDeadline(v.discoveredAtMs) : null, clock: incidentClock(v, now) }; })
    .sort((p, q) => q.discoveredAtMs - p.discoveredAtMs);
  const requests = b.docs.map((d) => { const x = d.data(); const v = { id: d.id, kind: x.kind as RequestKind, requester: String(x.requester ?? ''), note: String(x.note ?? ''), status: x.status as RequestStatus, receivedAtMs: ms(x.receivedAt), notes: notesOf(x.notes) }; return { ...v, deadlineMs: requestDeadline(v.receivedAtMs), clock: requestClock(v, now) }; })
    .sort((p, q) => q.receivedAtMs - p.receivedAtMs);
  return { incidents, requests };
}

export async function createIncident(i: NewIncident, by: string): Promise<string> {
  const r = await inc().add({ title: i.title, description: i.description, severity: i.severity, personalData: i.personalData, status: 'open', discoveredAt: Timestamp.fromMillis(i.discoveredAtMs), createdAt: Timestamp.now(), createdBy: by, notes: [] });
  return r.id;
}
export async function createRequest(r: NewRequest, by: string): Promise<string> {
  const d = await req().add({ kind: r.kind, requester: r.requester, note: r.note, status: 'open', receivedAt: Timestamp.fromMillis(r.receivedAtMs), createdAt: Timestamp.now(), createdBy: by, notes: [] });
  return d.id;
}

/** Moves a status and/or adds a dated note. Returns false when the entry does not exist or the status is not valid. */
export async function updateEntry(type: 'incident' | 'request', id: string, patch: { status?: unknown; note?: unknown }, by: string): Promise<boolean> {
  if (!okId(id)) return false;
  const ref = (type === 'incident' ? inc() : req()).doc(id);
  const statuses = (type === 'incident' ? INCIDENT_STATUS : REQUEST_STATUS) as readonly string[];
  const status = typeof patch.status === 'string' ? patch.status : '';
  if (status && !statuses.includes(status)) return false;
  const text = typeof patch.note === 'string' ? patch.note.trim().slice(0, 1000) : '';
  if (!status && !text) return false;
  return adminDb.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) return false;
    const notes = notesOf(s.data()?.notes);
    if (status && status !== s.data()?.status) notes.push({ at: Date.now(), by, text: `الحالة: ${s.data()?.status} ← ${status}` });
    if (text) notes.push({ at: Date.now(), by, text });
    tx.update(ref, { ...(status ? { status } : {}), notes: notes.slice(-100) });
    return true;
  });
}

export async function complianceCounts(now = Date.now()) {
  const [a, b] = await Promise.all([inc().where('status', 'in', ['open', 'contained']).limit(300).get(), req().where('status', '==', 'open').limit(300).get()]);
  return complianceAttention(
    a.docs.map((d) => ({ personalData: d.data().personalData === true, status: d.data().status as IncidentStatus, discoveredAtMs: ms(d.data().discoveredAt) })),
    b.docs.map((d) => ({ status: d.data().status as RequestStatus, receivedAtMs: ms(d.data().receivedAt) })),
    now,
  );
}
