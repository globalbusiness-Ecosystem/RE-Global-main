import { createHmac, timingSafeEqual } from 'node:crypto';

/** Checks a hex HMAC-SHA256 signature of the raw body, in constant time. */
export function verifyHmacSha256(rawBody: string, signatureHex: string | undefined, secret: string): boolean {
  if (!secret || !signatureHex || !/^[0-9a-f]{64}$/i.test(signatureHex)) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const given = Buffer.from(signatureHex, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function signHmacSha256(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}
