import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sessionTtlSeconds, ADMIN_SESSION_TTL_SECONDS } from '@/lib/admin-session';

describe('sessionTtlSeconds', () => {
  it('keeps 8 hours when nothing sensible is set', () => {
    for (const v of [undefined, null, '', 'abc', 0, '0', 0.5, -3, 25, '100', NaN, Infinity]) expect(sessionTtlSeconds(v)).toBe(8 * 3600);
  });
  it('accepts 1 to 24 hours, as a number or a string', () => {
    expect(sessionTtlSeconds(1)).toBe(3600);
    expect(sessionTtlSeconds('2')).toBe(7200);
    expect(sessionTtlSeconds('4')).toBe(4 * 3600);
    expect(sessionTtlSeconds(24)).toBe(24 * 3600);
    expect(sessionTtlSeconds('1.5')).toBe(5400);
  });
  it('the live value is the default when the setting is absent', () => {
    expect(ADMIN_SESSION_TTL_SECONDS).toBe(8 * 3600);
  });
});

describe('docs', () => {
  it('the operations guide explains the setting', () => {
    expect(readFileSync('docs/OPERATIONS.md', 'utf8')).toContain('ADMIN_SESSION_HOURS');
  });
});
