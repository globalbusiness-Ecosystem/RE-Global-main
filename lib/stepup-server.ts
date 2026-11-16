import 'server-only';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { MAX_PASSKEYS } from '@/lib/passkeys';

// "Confirm with your fingerprint" before money moves or data is erased. It is the account owner's choice (off by default):
// once on, the routes below ask for a one-time token that only a fresh fingerprint check can produce.

const SETTINGS = 'passkeySettings';
const TOKENS = 'stepupTokens';
export const STEPUP_TTL_MS = 2 * 60 * 1000;
export const STEPUP_HEADER = 'x-stepup-token'; // headers are case-insensitive; the client sends X-Stepup-Token (lib/stepup-header.ts)
const HEADERS = { 'Cache-Control': 'no-store' };

/** Only a hash of the token is stored, so a database leak does not hand out usable tokens. */
export const hashToken = (t: string): string => crypto.createHash('sha256').update(t).digest('hex');

export async function requiresStepUp(uid: string): Promise<boolean> {
  const s = await adminDb.collection(SETTINGS).doc(uid).get();
  return s.exists && (s.data() as { requireStepUp?: boolean }).requireStepUp === true;
}

export async function passkeyCount(uid: string): Promise<number> {
  return (await adminDb.collection('passkeys').where('uid', '==', uid).limit(MAX_PASSKEYS + 1).get()).size;
}

/** Called right after a fresh fingerprint check: a token valid for two minutes and one use. */
export async function issueStepUp(uid: string): Promise<string> {
  const token = crypto.randomBytes(24).toString('base64url');
  await adminDb.collection(TOKENS).doc(hashToken(token)).set({ uid, expiresAt: Timestamp.fromMillis(Date.now() + STEPUP_TTL_MS) });
  return token;
}

/** True once per token, only for the account it was issued to, and only while it is fresh. */
export async function consumeStepUp(uid: string, token: unknown): Promise<boolean> {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{20,64}$/.test(token)) return false;
  const ref = adminDb.collection(TOKENS).doc(hashToken(token));
  return adminDb.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return false;
    tx.delete(ref);
    const d = snap.data() as { uid?: string; expiresAt?: { toMillis(): number } };
    return d.uid === uid && !!d.expiresAt && d.expiresAt.toMillis() > Date.now();
  });
}

/** null when the action may go on; otherwise the response to send (403 stepup_required, or 503 when the check itself could not run). */
export async function stepUpGate(user: { uid: string }, req: NextRequest): Promise<NextResponse | null> {
  try {
    if (!(await requiresStepUp(user.uid))) return null;
    if (await consumeStepUp(user.uid, req.headers.get(STEPUP_HEADER))) return null;
    return NextResponse.json({ error: 'stepup_required' }, { status: 403, headers: HEADERS });
  } catch (err) {
    console.error('[stepup] gate error:', err);
    return NextResponse.json({ error: 'Try again' }, { status: 503, headers: HEADERS });
  }
}

export async function setRequireStepUp(uid: string, value: boolean): Promise<void> {
  await adminDb.collection(SETTINGS).doc(uid).set({ requireStepUp: value, updatedAt: Timestamp.now() });
}

/** Used when a person erases their data: their passkeys, settings and tokens go too. */
export async function eraseStepUpData(uid: string): Promise<void> {
  const keys = await adminDb.collection('passkeys').where('uid', '==', uid).limit(MAX_PASSKEYS + 5).get();
  const batch = adminDb.batch();
  for (const d of keys.docs) batch.delete(d.ref);
  batch.delete(adminDb.collection(SETTINGS).doc(uid));
  await batch.commit();
}
