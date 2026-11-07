// Sign-in outside the Pi Browser (Google, e-mail link). Client side only.
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

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

export async function logout(): Promise<void> {
  await signOut(auth);
}
