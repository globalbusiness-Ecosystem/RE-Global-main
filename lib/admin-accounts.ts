import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { hashPin, verifyPin, generatePin, isStrongStaffPin, cleanUsername } from '@/lib/admin-pin';
import { isRole, STAFF_ROLES, type AdminRole } from '@/lib/admin-roles';

// Staff admin accounts: admins/<id>. The owner is not stored here: the owner is the PIN account and is never limited or suspended.
// A suspended account is cut off on its very next request (the guard re-reads the status, cached for a few seconds at most).

const col = () => adminDb.collection('admins');
const CACHE_MS = 5_000;
const cache = new Map<string, { at: number; v: AdminStatus | null }>();

export type AdminStatus = { role: AdminRole; active: boolean; name: string; revokedAt: number };
export type AdminRow = { id: string; username: string; name: string; role: AdminRole; status: 'active' | 'suspended'; createdAt: string | null; lastLoginAt: string | null; suspendedReason: string };

const iso = (v: any): string | null => (v?.toDate ? v.toDate().toISOString() : null);
const forget = (id: string) => cache.delete(id);

/** Role and state of a staff account for the guard. Null when it no longer exists. */
export async function adminStatus(id: string, now = Date.now()): Promise<AdminStatus | null> {
  const hit = cache.get(id);
  if (hit && now - hit.at < CACHE_MS) return hit.v;
  let v: AdminStatus | null = null;
  try {
    const d = (await col().doc(id).get()).data();
    if (d && isRole(d.role)) v = { role: d.role, active: d.status === 'active', name: String(d.name ?? d.username ?? id), revokedAt: Number(d.revokedAt || 0) };
  } catch { v = null; } // unreadable store: treat as gone (deny)
  cache.set(id, { at: now, v });
  return v;
}

export async function listAdmins(): Promise<AdminRow[]> {
  const snap = await col().limit(200).get();
  return snap.docs.map((d) => {
    const x = d.data();
    return { id: d.id, username: String(x.username ?? ''), name: String(x.name ?? ''), role: isRole(x.role) ? x.role : 'viewer', status: (x.status === 'active' ? 'active' : 'suspended') as 'active' | 'suspended', createdAt: iso(x.createdAt), lastLoginAt: iso(x.lastLoginAt), suspendedReason: String(x.suspendedReason ?? '') };
  }).sort((a, b) => a.username.localeCompare(b.username));
}

/** Creates a staff account. Returns the PIN once (generated when none is given). */
export async function createAdmin(input: { username: unknown; name: unknown; role: unknown; pin?: unknown }): Promise<{ ok: true; id: string; pin: string } | { ok: false; error: 'username' | 'role' | 'pin' | 'exists' }> {
  const username = cleanUsername(input.username);
  if (!username) return { ok: false, error: 'username' };
  if (!isRole(input.role) || !STAFF_ROLES.includes(input.role)) return { ok: false, error: 'role' };
  const pin = typeof input.pin === 'string' && input.pin ? input.pin : generatePin();
  if (!isStrongStaffPin(pin)) return { ok: false, error: 'pin' };
  const ref = col().doc(username);
  const made = await adminDb.runTransaction(async (tx) => {
    if ((await tx.get(ref)).exists) return false;
    tx.set(ref, { username, name: String(input.name ?? '').trim().slice(0, 60) || username, role: input.role, status: 'active', pinHash: hashPin(pin), createdAt: Timestamp.now(), revokedAt: 0 });
    return true;
  });
  return made ? { ok: true, id: username, pin } : { ok: false, error: 'exists' };
}

/** Checks a staff login. The same answer for an unknown name, a wrong PIN and a suspended account. */
export async function checkStaffLogin(username: unknown, pin: unknown): Promise<{ ok: true; id: string; role: AdminRole; name: string } | { ok: false; suspended?: boolean; id?: string }> {
  const id = cleanUsername(username);
  if (!id || typeof pin !== 'string') return { ok: false };
  const d = (await col().doc(id).get().catch(() => null))?.data();
  const good = verifyPin(pin, d?.pinHash); // always runs a hash check so timing does not reveal whether the name exists
  if (!d || !good || !isRole(d.role)) return { ok: false };
  if (d.status !== 'active') return { ok: false, suspended: true, id };
  await col().doc(id).update({ lastLoginAt: Timestamp.now() }).catch(() => {});
  return { ok: true, id, role: d.role, name: String(d.name ?? id) };
}

export async function suspendAdmin(id: string, reason: string): Promise<boolean> {
  const ref = col().doc(id);
  if (!(await ref.get()).exists) return false;
  await ref.update({ status: 'suspended', suspendedAt: Timestamp.now(), suspendedReason: reason.slice(0, 200), revokedAt: Math.floor(Date.now() / 1000) });
  forget(id);
  return true;
}
export async function resumeAdmin(id: string): Promise<boolean> {
  const ref = col().doc(id);
  if (!(await ref.get()).exists) return false;
  await ref.update({ status: 'active', suspendedReason: '' });
  forget(id);
  return true;
}
export async function setAdminRole(id: string, role: unknown): Promise<boolean> {
  if (!isRole(role) || !STAFF_ROLES.includes(role)) return false;
  const ref = col().doc(id);
  if (!(await ref.get()).exists) return false;
  await ref.update({ role, revokedAt: Math.floor(Date.now() / 1000) }); // a new role means a fresh sign-in
  forget(id);
  return true;
}
/** New PIN (shown once); the old sessions stop. */
export async function resetAdminPin(id: string): Promise<string | null> {
  const ref = col().doc(id);
  if (!(await ref.get()).exists) return null;
  const pin = generatePin();
  await ref.update({ pinHash: hashPin(pin), revokedAt: Math.floor(Date.now() / 1000) });
  forget(id);
  return pin;
}
export async function deleteAdmin(id: string): Promise<boolean> {
  const ref = col().doc(id);
  if (!(await ref.get()).exists) return false;
  await ref.delete();
  forget(id);
  return true;
}
