// Passkeys (Face ID, fingerprint, Windows Hello...) - the parts that need no server or browser: which sites may use them,
// how a name is cleaned, how long a challenge lives. A passkey is tied to the site's host name, so the list of allowed sites is explicit.

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;
export const MAX_PASSKEYS = 5;
export const RP_NAME = 'RE Global';
export type PasskeyPurpose = 'register' | 'login' | 'admin' | 'stepup';

const DEFAULT_ORIGINS = ['https://re-global-main.vercel.app'];

/** The sites that may register or use passkeys: the defaults, `PASSKEY_ORIGINS` (comma separated) and localhost for development. */
export function allowedOrigins(env: { PASSKEY_ORIGINS?: string; NODE_ENV?: string } = process.env): string[] {
  const extra = (env.PASSKEY_ORIGINS ?? '').split(',').map((s) => s.trim().replace(/\/+$/, '')).filter((s) => /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(s));
  const dev = env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://localhost:3111'];
  return Array.from(new Set([...DEFAULT_ORIGINS, ...extra, ...dev]));
}

/** The origin the browser reports, if it is one we allow; otherwise null. */
export function matchOrigin(origin: unknown, allowed: string[] = allowedOrigins()): string | null {
  if (typeof origin !== 'string') return null;
  const o = origin.trim().replace(/\/+$/, '');
  return allowed.includes(o) ? o : null;
}

/** The relying-party id of an allowed origin: its host name. */
export const rpIdOf = (origin: string): string => new URL(origin).hostname;

/** A device name the person typed, cleaned; a default when empty. */
export function cleanLabel(v: unknown, fallback = 'My device'): string {
  const s = typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40) : '';
  return s || fallback;
}

/** Credential ids are base64url text; anything else is refused before it reaches the database (they are used as document ids). */
export const isCredentialId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{16,512}$/.test(v);

export const challengeExpired = (expiresAtMs: number, now = Date.now()): boolean => !Number.isFinite(expiresAtMs) || expiresAtMs <= now;
