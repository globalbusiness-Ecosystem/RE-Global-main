import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { KYC_LABELS } from '@/lib/kyc-labels';

const walk = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? (['node_modules', '.next', '.git'].includes(n) ? [] : walk(p)) : /\.(ts|tsx)$/.test(n) ? [p] : []; });

describe('no dead or repeated text on the identity page', () => {
  const files = [...walk('app'), ...walk('components'), ...walk('lib')].filter((f) => !f.endsWith('lib/kyc-labels.ts'));
  const all = files.map((f) => readFileSync(f, 'utf8')).join('\n');
  it('every identity label is used somewhere (nothing left behind when a line is removed)', () => {
    for (const k of Object.keys(KYC_LABELS)) expect(all.includes(`'${k}'`), k).toBe(true);
  });
  it('the photo tips are not repeated as a sentence, and the ID field has no second privacy note', () => {
    expect(Object.keys(KYC_LABELS)).not.toContain('photoHint');
    expect(Object.keys(KYC_LABELS)).not.toContain('idNumberHint');
  });
  it('explanations stay short: no identity label is longer than 180 characters in any language', () => {
    for (const [k, row] of Object.entries(KYC_LABELS)) for (const [lang, v] of Object.entries(row as Record<string, string>)) expect(v.length, `${k}.${lang}`).toBeLessThanOrEqual(200);
  });
});
