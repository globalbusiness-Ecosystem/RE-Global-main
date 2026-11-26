import 'server-only';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logAdmin } from '@/lib/admin-audit';
import { alertAdmin, adminAlertContext } from '@/lib/admin-alert';
import { spendLoginAttempt } from '@/lib/admin-login-budget';
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_TTL_SECONDS, createAdminToken, type AdminIdentity } from '@/lib/admin-session';

// What every way of signing in to the admin panel shares: the lock after repeated failures, the global attempt budget,
// and the final step that logs the sign-in, alerts the owner and sets the session cookie.

export const MAX_FAILURES = 5;
export const LOCK_MINUTES = 15;
const memoryAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function clientKey(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}
export async function getDb() {
  try { return (await import('@/lib/firebase-admin')).adminDb; } catch { return null; }
}
export async function checkLocked(key: string): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      const snap = await db.collection('admin_login_attempts').doc(key).get();
      return (snap.exists ? Number(snap.data()?.lockedUntil || 0) : 0) > Date.now();
    } catch { /* fall back to memory */ }
  }
  return (memoryAttempts.get(key)?.lockedUntil ?? 0) > Date.now();
}
export async function registerFailure(key: string): Promise<void> {
  const db = await getDb();
  if (db) {
    try {
      const ref = db.collection('admin_login_attempts').doc(key);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const prev = snap.exists ? snap.data()! : {};
        const expired = Number(prev.lockedUntil || 0) && Number(prev.lockedUntil) <= Date.now();
        const count = (expired ? 0 : Number(prev.count || 0)) + 1;
        tx.set(ref, {
          count: count >= MAX_FAILURES ? 0 : count,
          lockedUntil: count >= MAX_FAILURES ? Date.now() + LOCK_MINUTES * 60000 : 0,
          updatedAt: Date.now(),
        });
      });
      return;
    } catch { /* fall back to memory */ }
  }
  const prev = memoryAttempts.get(key) ?? { count: 0, lockedUntil: 0 };
  const count = prev.count + 1;
  memoryAttempts.set(key, {
    count: count >= MAX_FAILURES ? 0 : count,
    lockedUntil: count >= MAX_FAILURES ? Date.now() + LOCK_MINUTES * 60000 : 0,
  });
}
export async function clearFailures(key: string): Promise<void> {
  memoryAttempts.delete(key);
  const db = await getDb();
  if (db) { try { await db.collection('admin_login_attempts').doc(key).delete(); } catch { /* ignore */ } }
}


/** Refuses (429) when this caller is locked out or the global budget is spent; null when the attempt may go on. */
export async function loginGate(req: NextRequest, key: string): Promise<NextResponse | null> {
  if (await checkLocked(key)) {
    await alertAdmin('lockout', 'محاولات دخول للأدمن أثناء القفل', adminAlertContext(req));
    return NextResponse.json({ ok: false, error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.` }, { status: 429 });
  }
  const budget = await spendLoginAttempt();
  if (!budget.ok) {
    await alertAdmin('budget', 'محاولات دخول أدمن كتيرة من أجهزة مختلفة', adminAlertContext(req));
    return NextResponse.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(budget.retryAfter) } });
  }
  return null;
}

/** The sign-in succeeded: forget the failures, log it, alert the owner and answer with the session cookie. `method` says which second step was used. */
export async function completeAdminLogin(req: NextRequest, key: string, method: 'pin' | 'totp' | 'passkey', who?: AdminIdentity): Promise<NextResponse> {
  await clearFailures(key);
  await logAdmin('admin.login', { twoFactor: method !== 'pin', method, actor: who?.sub ?? 'owner', role: who?.role ?? 'owner' });
  const label = method === 'passkey' ? 'بصمة' : method === 'totp' ? 'كود التحقق' : 'مقفول';
  await alertAdmin(who ? `login-${who.sub}` : 'login', who ? `دخول الأدمن ${who.name ?? who.sub} (${who.role})` : 'تسجيل دخول جديد للأدمن', { ...adminAlertContext(req), 'التحقق بخطوتين': label });
  const token = await createAdminToken(who);
  if (!token) return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: ADMIN_SESSION_TTL_SECONDS, path: '/',
  });
  return res;
}
