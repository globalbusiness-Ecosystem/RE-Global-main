import 'server-only';
import crypto from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import {
  generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse,
  type AuthenticationResponseJSON, type RegistrationResponseJSON, type AuthenticatorTransport,
} from '@simplewebauthn/server';
import { adminDb } from '@/lib/firebase-admin';
import { CHALLENGE_TTL_MS, MAX_PASSKEYS, RP_NAME, cleanLabel, isCredentialId, matchOrigin, rpIdOf, type PasskeyPurpose } from '@/lib/passkeys';

type Doc = Record<string, any>;
const KEYS = 'passkeys';
const CHALLENGES = 'passkeyChallenges';

export type PasskeyView = { id: string; label: string; deviceType: string; backedUp: boolean; createdAt: string | null; lastUsedAt: string | null };
const iso = (v: any): string | null => (v?.toMillis ? new Date(v.toMillis()).toISOString() : null);
const toView = (id: string, d: Doc): PasskeyView => ({ id, label: String(d.label ?? ''), deviceType: String(d.deviceType ?? ''), backedUp: !!d.backedUp, createdAt: iso(d.createdAt), lastUsedAt: iso(d.lastUsedAt) });
const b64u = (b: Uint8Array | Buffer) => Buffer.from(b).toString('base64url');

export async function listPasskeys(uid: string): Promise<PasskeyView[]> {
  const s = await adminDb.collection(KEYS).where('uid', '==', uid).limit(MAX_PASSKEYS + 5).get();
  return s.docs.map((d: any) => toView(d.id, d.data())).sort((a: PasskeyView, b: PasskeyView) => String(a.createdAt).localeCompare(String(b.createdAt)));
}

export async function deletePasskey(uid: string, id: string): Promise<boolean> {
  if (!isCredentialId(id)) return false;
  const ref = adminDb.collection(KEYS).doc(id);
  const snap = await ref.get();
  if (!snap.exists || (snap.data() as Doc).uid !== uid) return false;
  await ref.delete();
  return true;
}

// A challenge is a one-time random value the browser must sign; it is kept for a few minutes and used once.
async function storeChallenge(purpose: PasskeyPurpose, uid: string, challenge: string): Promise<string> {
  const id = crypto.randomBytes(18).toString('base64url');
  await adminDb.collection(CHALLENGES).doc(id).set({ purpose, uid, challenge, expiresAt: Timestamp.fromMillis(Date.now() + CHALLENGE_TTL_MS) });
  return id;
}

async function takeChallenge(id: unknown, purpose: PasskeyPurpose, uid: string): Promise<string | null> {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) return null;
  const ref = adminDb.collection(CHALLENGES).doc(id);
  return adminDb.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    tx.delete(ref); // used once, whatever the outcome
    const d = snap.data() as Doc;
    if (d.purpose !== purpose || d.uid !== uid || !(d.expiresAt?.toMillis?.() > Date.now())) return null;
    return String(d.challenge);
  });
}

export type BeginResult = { ok: true; challengeId: string; options: unknown } | { ok: false; status: number; error: 'origin' | 'limit' };

export async function beginRegistration(uid: string, username: string, origin: unknown): Promise<BeginResult> {
  const o = matchOrigin(origin);
  if (!o) return { ok: false, status: 400, error: 'origin' };
  const existing = await adminDb.collection(KEYS).where('uid', '==', uid).limit(MAX_PASSKEYS + 1).get();
  if (existing.size >= MAX_PASSKEYS) return { ok: false, status: 409, error: 'limit' };
  const options = await generateRegistrationOptions({
    rpName: RP_NAME, rpID: rpIdOf(o), userName: username, userDisplayName: username,
    userID: crypto.createHash('sha256').update(uid).digest(), // stable, not the account name itself
    attestationType: 'none',
    excludeCredentials: existing.docs.map((d: any) => ({ id: d.id })),
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
  });
  return { ok: true, challengeId: await storeChallenge('register', uid, options.challenge), options };
}

export type FinishRegistration = { ok: true; passkey: PasskeyView } | { ok: false; status: number; error: 'origin' | 'challenge' | 'verify' | 'duplicate' | 'limit' };

export async function finishRegistration(uid: string, username: string, input: { origin: unknown; challengeId: unknown; response: unknown; label: unknown }): Promise<FinishRegistration> {
  const o = matchOrigin(input.origin);
  if (!o) return { ok: false, status: 400, error: 'origin' };
  const challenge = await takeChallenge(input.challengeId, 'register', uid);
  if (!challenge) return { ok: false, status: 400, error: 'challenge' };
  let v;
  try {
    v = await verifyRegistrationResponse({ response: input.response as RegistrationResponseJSON, expectedChallenge: challenge, expectedOrigin: o, expectedRPID: rpIdOf(o), requireUserVerification: true });
  } catch { return { ok: false, status: 400, error: 'verify' }; }
  if (!v.verified || !v.registrationInfo) return { ok: false, status: 400, error: 'verify' };
  const { credential, credentialDeviceType, credentialBackedUp } = v.registrationInfo;
  if (!isCredentialId(credential.id)) return { ok: false, status: 400, error: 'verify' };
  const ref = adminDb.collection(KEYS).doc(credential.id);
  const now = Timestamp.now();
  const doc = { uid, username, publicKey: b64u(credential.publicKey), counter: credential.counter, transports: credential.transports ?? [], deviceType: credentialDeviceType, backedUp: credentialBackedUp, label: cleanLabel(input.label), createdAt: now, lastUsedAt: null };
  const made = await adminDb.runTransaction(async (tx: any): Promise<'ok' | 'duplicate' | 'limit'> => {
    if ((await tx.get(ref)).exists) return 'duplicate';
    const count = (await tx.get(adminDb.collection(KEYS).where('uid', '==', uid).limit(MAX_PASSKEYS + 1))).size;
    if (count >= MAX_PASSKEYS) return 'limit';
    tx.set(ref, doc);
    return 'ok';
  });
  if (made !== 'ok') return { ok: false, status: 409, error: made };
  return { ok: true, passkey: toView(credential.id, doc) };
}

/** Options for signing in with a passkey (used by the admin, step-up and login flows). `uid` limits it to one account's keys; null lets the device pick any saved key. */
export async function beginAuthentication(purpose: Exclude<PasskeyPurpose, 'register'>, uid: string | null, origin: unknown, challengeOwner: string): Promise<BeginResult> {
  const o = matchOrigin(origin);
  if (!o) return { ok: false, status: 400, error: 'origin' };
  let allow: { id: string }[] | undefined;
  if (uid) {
    const s = await adminDb.collection(KEYS).where('uid', '==', uid).limit(MAX_PASSKEYS + 1).get();
    allow = s.docs.map((d: any) => ({ id: d.id }));
  }
  const options = await generateAuthenticationOptions({ rpID: rpIdOf(o), userVerification: 'required', allowCredentials: allow });
  return { ok: true, challengeId: await storeChallenge(purpose, challengeOwner, options.challenge), options };
}

export type FinishAuth = { ok: true; uid: string; username: string; credentialId: string } | { ok: false; status: number; error: 'origin' | 'challenge' | 'unknown_key' | 'verify' };

/** Checks the signed answer. `expectUid` (when given) must own the key. Updates the use counter, which also detects cloned keys. */
export async function finishAuthentication(purpose: Exclude<PasskeyPurpose, 'register'>, challengeOwner: string, expectUid: string | null, input: { origin: unknown; challengeId: unknown; response: unknown }): Promise<FinishAuth> {
  const o = matchOrigin(input.origin);
  if (!o) return { ok: false, status: 400, error: 'origin' };
  const challenge = await takeChallenge(input.challengeId, purpose, challengeOwner);
  if (!challenge) return { ok: false, status: 400, error: 'challenge' };
  const response = input.response as AuthenticationResponseJSON;
  const id = response?.id;
  if (!isCredentialId(id)) return { ok: false, status: 400, error: 'unknown_key' };
  const ref = adminDb.collection(KEYS).doc(id);
  const snap = await ref.get();
  const d = snap.exists ? (snap.data() as Doc) : null;
  if (!d || (expectUid && d.uid !== expectUid)) return { ok: false, status: 400, error: 'unknown_key' };
  let v;
  try {
    v = await verifyAuthenticationResponse({
      response, expectedChallenge: challenge, expectedOrigin: o, expectedRPID: rpIdOf(o), requireUserVerification: true,
      credential: { id, publicKey: Buffer.from(String(d.publicKey), 'base64url'), counter: Number(d.counter) || 0, transports: (d.transports ?? []) as AuthenticatorTransport[] },
    });
  } catch { return { ok: false, status: 400, error: 'verify' }; }
  if (!v.verified) return { ok: false, status: 400, error: 'verify' };
  await ref.update({ counter: v.authenticationInfo.newCounter, lastUsedAt: Timestamp.now() });
  return { ok: true, uid: String(d.uid), username: String(d.username), credentialId: id };
}
