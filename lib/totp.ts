import crypto from 'crypto';

// Time-based one-time passwords (RFC 6238, SHA-1, 6 digits, 30 s) for the admin's second login step.
// Works with Google Authenticator, Microsoft Authenticator, Authy, 1Password... No dependencies.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { out += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer | null {
  const s = input.replace(/[\s=-]+/g, '').toUpperCase();
  if (s.length < 16) return null; // at least 80 bits
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of s) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) return null;
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export function generateSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function hotp(secret: Buffer, counter: number, digits = 6): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', secret).update(msg).digest();
  const o = h[h.length - 1] & 15;
  const bin = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(bin % 10 ** digits).padStart(digits, '0');
}

const STEP_S = 30;

// The 30-second step the code belongs to (so a code can be refused the second time), or null if it is wrong.
// Accepts one step either side to forgive small clock differences.
export function matchTotp(secretB32: string, code: unknown, nowMs = Date.now(), window = 1): number | null {
  const secret = base32Decode(secretB32);
  if (!secret || typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) return null;
  const given = Buffer.from(code.trim());
  const now = Math.floor(nowMs / 1000 / STEP_S);
  let hit: number | null = null;
  for (let w = -window; w <= window; w++) {
    const expected = Buffer.from(hotp(secret, now + w));
    if (crypto.timingSafeEqual(expected, given) && hit === null) hit = now + w;
  }
  return hit;
}
