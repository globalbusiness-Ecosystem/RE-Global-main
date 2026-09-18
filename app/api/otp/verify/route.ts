import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(req: NextRequest) {
  let body: { username?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  const { username, code } = body;
  if (!username || !code) {
    return NextResponse.json({ ok: false, error: 'Missing username/code' }, { status: 400 });
  }

  const otpRef = adminDb.collection('email_otps').doc(username);

  try {
    const snap = await otpRef.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: 'No verification pending' }, { status: 400 });
    }

    const data = snap.data()!;
    const expiresAt = (data.expiresAt as Timestamp).toDate();

    if (Date.now() > expiresAt.getTime()) {
      await otpRef.delete();
      return NextResponse.json({ ok: false, error: 'Code expired — request a new one' }, { status: 400 });
    }

    if ((data.attempts ?? 0) >= MAX_ATTEMPTS) {
      await otpRef.delete();
      return NextResponse.json({ ok: false, error: 'Too many attempts — request a new code' }, { status: 429 });
    }

    if (hashCode(code) !== data.codeHash) {
      await otpRef.update({ attempts: (data.attempts ?? 0) + 1 });
      return NextResponse.json({ ok: false, error: 'Incorrect code' }, { status: 400 });
    }

    // Success — mark the email verified on the user's profile and clean up.
    await adminDb.collection('profiles').doc(username).set(
      { emailVerified: true, verifiedEmail: data.email, emailVerifiedAt: Timestamp.now() },
      { merge: true }
    );
    await otpRef.delete();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[OTP] Verify error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
