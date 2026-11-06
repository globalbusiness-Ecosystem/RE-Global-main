import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CONSENT_LABELS, cl } from '@/lib/consent-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('first-visit consent window labels', () => {
  it('every label exists in all 7 languages and ar/ur/zh differ from English', () => {
    for (const [key, row] of Object.entries(CONSENT_LABELS)) {
      for (const l of LANGS) expect(row[l].trim().length, `${key}.${l}`).toBeGreaterThan(0);
      for (const l of ['ar', 'ur', 'zh'] as const) expect(row[l], `${key}.${l}`).not.toBe(row.en);
    }
  });
  it('unknown or hostile language codes fall back to English', () => {
    for (const l of ['__proto__', 'constructor', 'xx', undefined]) expect(cl('accept', l as string | undefined)).toBe('Accept & Continue');
  });
  it('the window reads its texts through cl() and tells non-English readers the documents are in English', () => {
    const src = readFileSync('components/terms-consent-modal.tsx', 'utf8');
    for (const old of ['>Before you continue<', 'Accept & Continue\n', '<span>I have read']) expect(src, old).not.toContain(old);
    expect(src.match(/cl\('/g)?.length).toBeGreaterThanOrEqual(6);
    expect(src).toContain("language !== 'en'");
  });
  it('the window still stores the acceptance only after the box is ticked', () => {
    const src = readFileSync('components/terms-consent-modal.tsx', 'utf8');
    expect(src).toContain('if (!checked) return;');
    expect(src).toContain('re_terms_privacy_accepted_v1');
  });
});
