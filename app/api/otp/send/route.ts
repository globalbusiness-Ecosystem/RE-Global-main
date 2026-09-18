import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: 'Email service not configured' }, { status: 500 });
  }

  let body: { username?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  const { username, email } = body;
  if (!username || !email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid username/email' }, { status: 400 });
  }

  const docRef = adminDb.collection('email_otps').doc(username);

  try {
    const existing = await docRef.get();
    if (existing.exists) {
      const data = existing.data()!;
      const lastSentAt = (data.lastSentAt as Timestamp | undefined)?.toDate();
      if (lastSentAt && Date.now() - lastSentAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
        return NextResponse.json(
          { ok: false, error: 'Please wait before requesting another code' },
          { status: 429 }
        );
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    // Send first — only persist (and start the resend cooldown) once the
    // email genuinely went out. A failed send must never lock the user
    // into a cooldown with no code actually delivered.
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'RE Platform <onboarding@resend.dev>',
      to: email,
      subject: 'Your RE Platform verification code',
      html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>`,
    });

    if (error) {
      console.error('[OTP] Resend send error:', error);
      return NextResponse.json({ ok: false, error: 'Failed to send email' }, { status: 502 });
    }

    await docRef.set({
      username,
      email,
      codeHash: hashCode(code),
      attempts: 0,
      expiresAt: Timestamp.fromDate(expiresAt),
      lastSentAt: Timestamp.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[OTP] Send error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
