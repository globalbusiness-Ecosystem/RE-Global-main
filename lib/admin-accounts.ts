import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { hashPin, verifyPin, generatePin, isStrongStaffPin, cleanUsername } from '@/lib/admin-pin';
import { isRole, STAFF_ROLES, type AdminRole } from '@/lib/admin-roles';
import { matchTotp, generateSecret } from '@/lib/totp';
import { totpGate, otpauthUri, isFreshStep } from '@/lib/admin-staff-totp';
import { encryptField, decryptField } from '@/lib/field-crypto';

// Staff admin accounts: admins/<id>. The owner is not stored here: the owner is the PIN account and is never limited or suspended.
// A suspended account is cut off on its very next request (the guard re-reads the status, cached for a few seconds at most).

const col = () => adminDb.collection('admins');
const CACHE_MS = 5_000;
const cache = new Map<string, { at: number; v: AdminStatus | null }>();

export type AdminStatus = { role: AdminRole; active: boolean; name: string; revokedAt: number };
export type AdminRow = { id: string; username: string; name: string; role: AdminRole; status: 'active' | 'suspended'; createdAt: string | null; lastLoginAt: string | null; suspendedReason: string; totp: boolean };

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
    return { id: d.id, username: String(x.username ?? ''), name: String(x.name ?? ''), role: isRole(x.role) ? x.role : 'viewer', status: (x.status === 'active' ? 'active' : 'suspended') as 'active' | 'suspended', createdAt: iso(x.createdAt), lastLoginAt: iso(x.lastLoginAt), suspendedReason: String(x.suspendedReason ?? ''), totp: x.totp?.enabled === true };
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

/** The owner's switch: every staff login needs an authenticator code (settings/adminSecurity.requireStaffTotp). */
export async function getRequireStaffTotp(): Promise<boolean> {
  try { return (await adminDb.collection('settings').doc('adminSecurity').get()).data()?.requireStaffTotp === true; } catch { return false; }
}
export async function setRequireStaffTotp(v: boolean): Promise<void> {
  await adminDb.collection('settings').doc('adminSecurity').set({ requireStaffTotp: v }, { merge: true });
}

type Loaded = { id: string; d: FirebaseFirestore.DocumentData; role: AdminRole };
/** Name + PIN. The same answer for an unknown name, a wrong PIN and a suspended account (suspended is only told apart for the owner's alert). */
async function loadStaff(username: unknown, pin: unknown): Promise<{ ok: true; v: Loaded } | { ok: false; suspended?: boolean; id?: string }> {
  const id = cleanUsername(username);
  if (!id || typeof pin !== 'string') return { ok: false };
  const d = (await col().doc(id).get().catch(() => null))?.data();
  const good = verifyPin(pin, d?.pinHash); // always runs a hash check so timing does not reveal whether the name exists
  if (!d || !good || !isRole(d.role)) return { ok: false };
  if (d.status !== 'active') return { ok: false, suspended: true, id };
  return { ok: true, v: { id, d, role: d.role } };
}

export type StaffLogin =
  | { ok: true; id: string; role: AdminRole; name: string; usedCode: boolean }
  | { ok: false; suspended?: boolean; id?: string; needCode?: boolean; needEnroll?: boolean; badCode?: boolean };

/** Checks a staff login: PIN, then (when the account has one, or the owner requires one) the authenticator code. A code works once. */
export async function checkStaffLogin(username: unknown, pin: unknown, code?: unknown): Promise<StaffLogin> {
  const r = await loadStaff(username, pin);
  if (!r.ok) return r;
  const { id, d, role } = r.v;
  const enrolled = d.totp?.enabled === true;
  const gate = totpGate({ enrolled, required: enrolled ? false : await getRequireStaffTotp(), code });
  if (gate === 'needCode') return { ok: false, needCode: true };
  if (gate === 'needEnroll') return { ok: false, needEnroll: true };
  if (gate === 'check') {
    const step = matchTotp(decryptField(d.totp.secret), code);
    if (!isFreshStep(step, Number(d.totp.lastStep || 0))) return { ok: false, badCode: true, id };
    await col().doc(id).update({ 'totp.lastStep': step }).catch(() => {});
  }
  await col().doc(id).update({ lastLoginAt: Timestamp.now() }).catch(() => {});
  return { ok: true, id, role, name: String(d.name ?? id), usedCode: gate === 'check' };
}

/** Step 1 of setting up the app: a new secret, shown once (PIN proves who is asking). Not allowed once a code is already active. */
export async function beginTotp(username: unknown, pin: unknown): Promise<{ ok: true; secret: string; uri: string } | { ok: false; reason: 'auth' | 'already' }> {
  const r = await loadStaff(username, pin);
  if (!r.ok) return { ok: false, reason: 'auth' };
  if (r.v.d.totp?.enabled === true) return { ok: false, reason: 'already' };
  const secret = generateSecret();
  await col().doc(r.v.id).update({ totp: { secret: encryptField(secret), enabled: false, lastStep: 0 } });
  return { ok: true, secret, uri: otpauthUri(r.v.id, secret) };
}
/** Step 2: the first code proves the app is set up; from then on every login needs a code. */
export async function confirmTotp(username: unknown, pin: unknown, code: unknown): Promise<{ ok: true } | { ok: false; reason: 'auth' | 'code' }> {
  const r = await loadStaff(username, pin);
  if (!r.ok) return { ok: false, reason: 'auth' };
  const t = r.v.d.totp;
  if (!t || t.enabled === true || !t.secret) return { ok: false, reason: 'code' };
  const step = matchTotp(decryptField(t.secret), code);
  if (step === null) return { ok: false, reason: 'code' };
  await col().doc(r.v.id).update({ 'totp.enabled': true, 'totp.lastStep': step });
  return { ok: true };
}
/** The owner removes an admin's authenticator (lost phone). Their sessions stop; they set it up again at the next login. */
export async function resetAdminTotp(id: string): Promise<boolean> {
  const ref = col().doc(id);
  if (!(await ref.get()).exists) return false;
  await ref.update({ totp: FieldValue.delete(), revokedAt: Math.floor(Date.now() / 1000) });
  forget(id);
  return true;
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
