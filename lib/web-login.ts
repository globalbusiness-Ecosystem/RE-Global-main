// Sign-in outside the Pi Browser (Google, e-mail link). Client side only.
import {
  GoogleAuthProvider,
  signInWithCustomToken,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { answerChallenge } from '@/lib/passkey-client';

const EMAIL_KEY = 're_login_email_v1';
const EMAIL_SHAPE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export const isValidEmail = (e: string): boolean => EMAIL_SHAPE.test(e.trim());

function remember(email: string | null) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  } catch {}
}
function remembered(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

export async function loginWithGoogle(): Promise<void> {
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function sendLoginLink(email: string): Promise<void> {
  const e = email.trim();
  if (!isValidEmail(e)) throw new Error('invalid-email');
  await sendSignInLinkToEmail(auth, e, { url: `${window.location.origin}/login`, handleCodeInApp: true });
  remember(e);
}

export const isLoginLink = (): boolean => typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href);

/** Finishes sign-in when the person opens the link from their mail. `email` is needed only on another device. */
export async function finishLinkLogin(email?: string): Promise<'done' | 'needs-email'> {
  const e = (email ?? remembered() ?? '').trim();
  if (!isValidEmail(e)) return 'needs-email';
  await signInWithEmailLink(auth, e, window.location.href);
  remember(null);
  return 'done';
}

/** Fingerprint sign-in for a web account that added a device in Settings. 'cancelled' when the person closes the device prompt. */
export async function loginWithPasskey(): Promise<'done' | 'cancelled'> {
  const o = await fetch('/api/auth/passkey-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ step: 'options' }) });
  const od = await o.json().catch(() => null);
  if (!o.ok || !od?.options) throw new Error('passkey-options');
  const response = await answerChallenge(od.options);
  if (!response) return 'cancelled';
  const v = await fetch('/api/auth/passkey-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ step: 'verify', challengeId: od.challengeId, response }) });
  const vd = await v.json().catch(() => null);
  if (!v.ok || typeof vd?.token !== 'string') throw new Error('passkey-verify');
  await signInWithCustomToken(auth, vd.token);
  return 'done';
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
