import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';

export const dynamic = 'force-dynamic';
const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}
function hashesMatch(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}
type Outcome = { ok: boolean; error?: string; status?: number };

export async function POST(req: NextRequest) {
  let user;
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    user = await verifyPiAccessToken(token);
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status });
  }
  let body: { username?: string; code?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 }); }

  const { code } = body;
  if (body.username && body.username.toLowerCase() !== user.username.toLowerCase()) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid code' }, { status: 400 });
  }
  const username = user.username;
  const otpRef = adminDb.collection('email_otps').doc(username);

  try {
    const outcome = await adminDb.runTransaction<Outcome>(async (tx) => {
      const snap = await tx.get(otpRef);
      if (!snap.exists) return { ok: false, error: 'No verification pending', status: 400 };
      const data = snap.data()!;
      if (Date.now() > (data.expiresAt as Timestamp).toDate().getTime()) {
        tx.delete(otpRef);
        return { ok: false, error: 'Code expired — request a new one', status: 400 };
      }
      const attempts = Number(data.attempts ?? 0);
      if (attempts >= MAX_ATTEMPTS) {
        tx.delete(otpRef);
        return { ok: false, error: 'Too many attempts — request a new code', status: 429 };
      }
      if (!hashesMatch(hashCode(code), String(data.codeHash))) {
        tx.update(otpRef, { attempts: attempts + 1 });
        return { ok: false, error: 'Incorrect code', status: 400 };
      }
      tx.set(
        adminDb.collection('profiles').doc(username),
        { emailVerified: true, verifiedEmail: data.email, emailVerifiedAt: Timestamp.now() },
        { merge: true }
      );
      tx.delete(otpRef);
      return { ok: true };
    });
    if (!outcome.ok) {
      return NextResponse.json({ ok: false, error: outcome.error }, { status: outcome.status ?? 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[OTP] Verify error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
