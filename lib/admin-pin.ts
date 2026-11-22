import crypto from 'crypto';

// PINs of staff admin accounts. Stored only as a salted scrypt hash. A generated PIN is shown once, when the account is created or reset.
const N = 16384;

export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pin, salt, 32, { N });
  return `s1:${salt.toString('base64url')}:${h.toString('base64url')}`;
}

export function verifyPin(pin: string, stored: unknown): boolean {
  if (typeof stored !== 'string' || typeof pin !== 'string') return false;
  const [v, s, h] = stored.split(':');
  if (v !== 's1' || !s || !h) return false;
  try {
    const want = Buffer.from(h, 'base64url');
    const got = crypto.scryptSync(pin, Buffer.from(s, 'base64url'), want.length, { N });
    return got.length === want.length && crypto.timingSafeEqual(got, want);
  } catch { return false; }
}

/** At least 10 characters with a letter and a digit. */
export const isStrongStaffPin = (pin: unknown): boolean => typeof pin === 'string' && pin.length >= 10 && pin.length <= 100 && /[A-Za-z]/.test(pin) && /\d/.test(pin);

/** A random PIN (no look-alike characters) that always passes the strength rule. */
export function generatePin(): string {
  const letters = 'abcdefghjkmnpqrstuvwxyz', digits = '23456789', all = 'ABCDEFGHJKMNPQRSTUVWXYZ' + letters + digits;
  const pick = (set: string) => set[crypto.randomInt(set.length)];
  const chars = [pick(letters), pick(digits), ...Array.from({ length: 10 }, () => pick(all))];
  for (let i = chars.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}

/** A short login name: letters, digits, dot, dash, underscore; 3-24 characters; lower case. */
export function cleanUsername(v: unknown): string {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  return /^[a-z0-9._-]{3,24}$/.test(s) ? s : '';
}
