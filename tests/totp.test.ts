import { describe, it, expect } from 'vitest';
import { base32Decode, base32Encode, generateSecret, hotp, matchTotp } from '@/lib/totp';

// RFC 6238 test secret: ASCII "12345678901234567890".
const SECRET_B32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const at = (sec: number) => sec * 1000;

describe('totp', () => {
  it('matches the RFC 6238 test vectors (last 6 digits)', () => {
    const secret = base32Decode(SECRET_B32)!;
    expect(secret.toString()).toBe('12345678901234567890');
    expect(hotp(secret, Math.floor(59 / 30))).toBe('287082');
    expect(hotp(secret, Math.floor(1111111109 / 30))).toBe('081804');
    expect(hotp(secret, Math.floor(1234567890 / 30))).toBe('005924');
    expect(hotp(secret, Math.floor(2000000000 / 30))).toBe('279037');
  });

  it('accepts the right code and returns its step', () => {
    expect(matchTotp(SECRET_B32, '287082', at(59))).toBe(1);
  });

  it('forgives one step of clock drift but not more', () => {
    expect(matchTotp(SECRET_B32, '287082', at(59 + 30))).toBe(1);
    expect(matchTotp(SECRET_B32, '287082', at(59 + 90))).toBeNull();
  });

  it('refuses wrong, malformed and non-string codes', () => {
    expect(matchTotp(SECRET_B32, '000000', at(59))).toBeNull();
    expect(matchTotp(SECRET_B32, '28708', at(59))).toBeNull();
    expect(matchTotp(SECRET_B32, '2870821', at(59))).toBeNull();
    expect(matchTotp(SECRET_B32, 287082, at(59))).toBeNull();
    expect(matchTotp(SECRET_B32, 'abcdef', at(59))).toBeNull();
  });

  it('refuses a broken secret instead of accepting anything', () => {
    expect(matchTotp('short', '287082', at(59))).toBeNull();
    expect(matchTotp('!!!!!!!!!!!!!!!!!!!!', '287082', at(59))).toBeNull();
  });

  it('round-trips base32 and generates fresh 160-bit secrets', () => {
    const buf = Buffer.from('hello world 12345');
    expect(base32Decode(base32Encode(buf))!.equals(buf)).toBe(true);
    const a = generateSecret();
    expect(a).toMatch(/^[A-Z2-7]{32}$/);
    expect(generateSecret()).not.toBe(a);
  });
});
