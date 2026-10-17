import { describe, it, expect } from 'vitest';
import { BACKUP_COLLECTIONS, backupFilename, isBackupCollection, serializeValue } from '@/lib/backup';

describe('backup helpers', () => {
  it('only exports business collections, never personal data or secrets', () => {
    for (const bad of ['profiles', 'email_otps', 'admin_login_attempts', 'rate_limits', 'banned_users', 'admin_audit', '__proto__', 'constructor', '']) {
      expect(isBackupCollection(bad)).toBe(false);
    }
    expect(isBackupCollection('payouts')).toBe(true);
    expect(isBackupCollection(null)).toBe(false);
    expect(Object.keys(BACKUP_COLLECTIONS)).toContain('contracts');
  });

  it('turns timestamps and dates into ISO strings, deeply', () => {
    const ts = { toDate: () => new Date('2026-01-02T03:04:05Z') };
    expect(serializeValue({ a: ts, b: [ts, { c: new Date('2026-02-03T00:00:00Z') }], n: 5, s: 'x', z: null }))
      .toEqual({ a: '2026-01-02T03:04:05.000Z', b: ['2026-01-02T03:04:05.000Z', { c: '2026-02-03T00:00:00.000Z' }], n: 5, s: 'x', z: null });
  });

  it('survives a broken timestamp and undefined values', () => {
    expect(serializeValue({ toDate: () => { throw new Error('x'); } })).toBeNull();
    expect(serializeValue(undefined)).toBeNull();
  });

  it('names the file by collection and day', () => {
    expect(backupFilename('payouts', new Date('2026-10-17T10:00:00Z'))).toBe('re-global-payouts-2026-10-17.json');
  });
});
