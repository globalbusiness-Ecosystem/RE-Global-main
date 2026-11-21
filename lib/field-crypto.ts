import crypto from 'crypto';

// Field-level encryption for identity data (ID number, phone, legal name, photos) stored in Firestore.
// AES-256-GCM, a fresh random IV per value, format "enc:v1:<iv>:<tag>:<ciphertext>" (base64url). The key comes from KYC_ENC_KEY
// (32 bytes, hex or base64); it lives only in the server environment, never in the database, so a leaked database copy is unreadable.
// Values without the "enc:v1:" prefix are legacy plaintext and read back unchanged, so turning encryption on never breaks old records.

const PREFIX = 'enc:v1:';

/** The 32-byte key from the environment value, or null when it is missing or not 32 bytes. */
export function parseKey(raw: string | undefined | null): Buffer | null {
  const v = String(raw ?? '').trim();
  if (!v) return null;
  const buf = /^[a-fA-F0-9]{64}$/.test(v) ? Buffer.from(v, 'hex') : Buffer.from(v, 'base64');
  return buf.length === 32 ? buf : null;
}

export const vaultKey = (): Buffer | null => parseKey(process.env.KYC_ENC_KEY);

export const isEncrypted = (v: unknown): boolean => typeof v === 'string' && v.startsWith(PREFIX);

/** Encrypts a string. Without a key it returns the text unchanged (the app keeps working; the admin panel shows the vault as off). */
export function encryptField(plain: string, key: Buffer | null = vaultKey()): string {
  if (!key || plain === '' || isEncrypted(plain)) return plain;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return `${PREFIX}${iv.toString('base64url')}:${c.getAuthTag().toString('base64url')}:${ct.toString('base64url')}`;
}

/** Decrypts a value. Legacy plaintext passes through. Returns '' when the value is encrypted but cannot be opened (no key, wrong key, tampered). */
export function decryptField(value: unknown, key: Buffer | null = vaultKey()): string {
  if (typeof value !== 'string') return '';
  if (!isEncrypted(value)) return value;
  if (!key) return '';
  try {
    const [iv, tag, ct] = value.slice(PREFIX.length).split(':');
    const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
    d.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([d.update(Buffer.from(ct, 'base64url')), d.final()]).toString('utf8');
  } catch {
    return '';
  }
}

/** Keyed fingerprint (HMAC-SHA256) of a normalised ID number, to find the same document on two accounts without decrypting. Null without a key. */
export function idFingerprint(idNumber: string, key: Buffer | null = vaultKey()): string | null {
  if (!key) return null;
  const clean = String(idNumber).replace(/[\s-]/g, '').toUpperCase();
  if (!clean) return null;
  const sub = crypto.createHash('sha256').update('fingerprint|').update(key).digest();
  return crypto.createHmac('sha256', sub).update(clean).digest('hex');
}
