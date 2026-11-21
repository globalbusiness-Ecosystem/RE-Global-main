import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import crypto from 'crypto';
import { parseKey, encryptField, decryptField, isEncrypted, idFingerprint } from '@/lib/field-crypto';

const src = (p: string) => readFileSync(p, 'utf8');
const key = crypto.randomBytes(32), other = crypto.randomBytes(32);

describe('field encryption', () => {
  it('round-trips, uses a fresh IV each time, and hides the plaintext', () => {
    const a = encryptField('29001011234567', key), b = encryptField('29001011234567', key);
    expect(isEncrypted(a)).toBe(true);
    expect(a).not.toContain('2900101');
    expect(a).not.toBe(b);
    expect(decryptField(a, key)).toBe('29001011234567');
    expect(decryptField(encryptField('أحمد محمد', key), key)).toBe('أحمد محمد');
  });
  it('returns "" for a wrong key or a tampered value, never garbage', () => {
    const a = encryptField('secret', key);
    expect(decryptField(a, other)).toBe('');
    expect(decryptField(a, null)).toBe('');
    expect(decryptField(a.slice(0, -2) + 'AA', key)).toBe('');
  });
  it('without a key it stores plaintext, and legacy plaintext always reads back', () => {
    expect(encryptField('x', null)).toBe('x');
    expect(decryptField('plain value', key)).toBe('plain value');
    expect(decryptField(undefined, key)).toBe('');
  });
  it('does not double-encrypt and keeps empty values empty', () => {
    const a = encryptField('v', key);
    expect(encryptField(a, key)).toBe(a);
    expect(encryptField('', key)).toBe('');
  });
  it('accepts a 32-byte key as hex or base64 and nothing else', () => {
    expect(parseKey(key.toString('hex'))?.equals(key)).toBe(true);
    expect(parseKey(key.toString('base64'))?.equals(key)).toBe(true);
    expect(parseKey('short')).toBeNull();
    expect(parseKey('')).toBeNull();
  });
  it('fingerprints the same ID the same way whatever the spacing, and differently per key', () => {
    expect(idFingerprint('2900 1011-234567', key)).toBe(idFingerprint('29001011234567', key));
    expect(idFingerprint('29001011234567', key)).not.toBe(idFingerprint('29001011234567', other));
    expect(idFingerprint('29001011234567', key)).not.toBe(idFingerprint('29001011234568', key));
    expect(idFingerprint('29001011234567', null)).toBeNull();
  });
});

describe('vault wiring', () => {
  it('the KYC record, photos and private contract record are written encrypted and read through decrypt', () => {
    const k = src('lib/kyc-store.ts'), f = src('lib/kyc-files-store.ts'), p = src('lib/contract-private-store.ts');
    expect(k).toContain('encryptField(input.idNumber)');
    expect(k).toContain('encryptField(input.phone)');
    expect(k).toContain('idFingerprint(');
    expect(k).toContain('decryptField(x.idNumber)');
    expect(f).toContain('encryptField(');
    expect(f).toContain('decryptField(');
    expect(p).toContain('encryptField(idNumber)');
    expect(p).toContain('decryptField(d.idNumber)');
  });
  it('the admin migration route is admin-only and the key is documented', () => {
    expect(src('app/api/admin/kyc-vault/route.ts')).toContain('isAdminRequest(');
    expect(src('.env.example')).toContain('KYC_ENC_KEY');
  });
});
