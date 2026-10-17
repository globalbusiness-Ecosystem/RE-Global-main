import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { matchTotp } from '@/lib/totp';
import { logAdmin } from '@/lib/admin-audit';
import {
  ADMIN_COOKIE_NAME, ADMIN_SESSION_TTL_SECONDS, createAdminToken,
  isAdminRequest, isAdminSessionConfigured,
} from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const memoryAttempts = new Map<string, { count: number; lockedUntil: number }>();

function clientKey(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}
async function getDb() {
  try { return (await import('@/lib/firebase-admin')).adminDb; } catch { return null; }
}
async function checkLocked(key: string): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      const snap = await db.collection('admin_login_attempts').doc(key).get();
      return (snap.exists ? Number(snap.data()?.lockedUntil || 0) : 0) > Date.now();
    } catch { /* fall back to memory */ }
  }
  return (memoryAttempts.get(key)?.lockedUntil ?? 0) > Date.now();
}
async function registerFailure(key: string): Promise<void> {
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
async function clearFailures(key: string): Promise<void> {
  memoryAttempts.delete(key);
  const db = await getDb();
  if (db) { try { await db.collection('admin_login_attempts').doc(key).delete(); } catch { /* ignore */ } }
}

// A 6-digit code works once: remember the last accepted 30-second step, refuse the same step (or older) again.
const memoryStep = { v: 0 };
async function acceptStep(step: number): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      const ref = db.collection('admin_login_attempts').doc('_totp');
      return await db.runTransaction(async (tx) => {
        const last = Number((await tx.get(ref)).data()?.lastStep || 0);
        if (step <= last) return false;
        tx.set(ref, { lastStep: step, updatedAt: Date.now() });
        return true;
      });
    } catch { /* fall back to memory */ }
  }
  if (step <= memoryStep.v) return false;
  memoryStep.v = step;
  return true;
}

export async function POST(req: NextRequest) {
  const ADMIN_PIN = process.env.ADMIN_PIN;
  if (!ADMIN_PIN || !isAdminSessionConfigured()) {
    return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });
  }
  const key = clientKey(req);
  if (await checkLocked(key)) {
    return NextResponse.json({ ok: false, error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.` }, { status: 429 });
  }
  const totpSecret = process.env.ADMIN_TOTP_SECRET?.trim();
  let pin: unknown, code: unknown;
  try { ({ pin, code } = await req.json()); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 }); }

  if (typeof pin !== 'string' || !safeEqual(pin, ADMIN_PIN)) {
    await registerFailure(key);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (totpSecret) {
    // Second step: the 6-digit code. A wrong code counts like a wrong PIN, and the answer never says which one was wrong.
    const step = matchTotp(totpSecret, code);
    if (step === null || !(await acceptStep(step))) {
      await registerFailure(key);
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }
  await clearFailures(key);
  await logAdmin('admin.login', { twoFactor: !!totpSecret });
  const token = await createAdminToken();
  if (!token) return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: ADMIN_SESSION_TTL_SECONDS, path: '/',
  });
  return res;
}
export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: await isAdminRequest(req), twoFactor: !!process.env.ADMIN_TOTP_SECRET?.trim() });
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
