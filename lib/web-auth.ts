import 'server-only';

// Sign-in outside the Pi Browser: Google, Apple, e-mail link, phone... all handled by Firebase Auth.
// The browser sends the Firebase ID token the same way the Pi Browser sends the Pi access token.
// These people get their own name space ("web_..."), so a web account can never pose as a Pi account.

const JWT_SHAPE = /^[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}$/;
export const looksLikeJwt = (t: string): boolean => JWT_SHAPE.test(t);

export interface WebIdentity { uid: string; username: string }

type Claims = { uid?: unknown; email_verified?: unknown; firebase?: { sign_in_provider?: unknown } };

/** Turns the checked Firebase claims into an identity, or null when the account must not be accepted. */
export function webIdentityFromClaims(c: Claims): WebIdentity | null {
  const uid = typeof c.uid === 'string' ? c.uid : '';
  if (!uid || uid.length > 128 || uid.includes('/')) return null;
  const provider = typeof c.firebase?.sign_in_provider === 'string' ? c.firebase.sign_in_provider : '';
  // Pi users also hold Firebase tokens (provider "custom") - those are identified through Pi itself, never here.
  if (!provider || provider === 'custom' || provider === 'anonymous') return null;
  // An address nobody has proven is theirs is not an identity (phone sign-in has no e-mail, so it is exempt).
  if (provider !== 'phone' && c.email_verified !== true) return null;
  return { uid: `web_${uid}`, username: `web_${uid.slice(0, 10)}` };
}

/** The web identity behind a Firebase ID token, or null when the token is not (a valid) one - the caller then tries Pi. */
export async function verifyWebToken(token: string): Promise<WebIdentity | null> {
  if (!looksLikeJwt(token)) return null;
  try {
    const { adminAuth } = await import('@/lib/firebase-admin');
    const decoded = await adminAuth.verifyIdToken(token);
    return webIdentityFromClaims(decoded as unknown as Claims);
  } catch {
    return null;
  }
}
