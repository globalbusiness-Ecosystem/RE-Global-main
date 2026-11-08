import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { KYC_LABELS, kl, type KycLabelKey } from '@/lib/kyc-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const keys = Object.keys(KYC_LABELS) as KycLabelKey[];
const src = (p: string) => readFileSync(p, 'utf8');

describe('kyc labels', () => {
  it('has all 7 languages, non-empty, and ar/ur/zh differ from English', () => {
    for (const k of keys) for (const l of LANGS) expect(KYC_LABELS[k][l].trim().length, `${k}.${l}`).toBeGreaterThan(0);
    for (const k of keys) for (const l of ['ar', 'ur', 'zh'] as const) expect(KYC_LABELS[k][l], `${k}.${l}`).not.toBe(KYC_LABELS[k].en);
  });
  it('falls back to English for hostile codes and fills the reason', () => {
    for (const bad of ['__proto__', 'constructor', 'xx', undefined]) expect(kl('title', bad)).toBe('Identity verification');
    for (const l of LANGS) expect(KYC_LABELS.rejected[l]).toContain('{reason}');
    expect(kl('rejected', 'fr', { reason: 'Nom illisible' })).toContain('Nom illisible');
  });
  it('every key is used by the page or the card button', () => {
    const all = src('app/kyc/page.tsx') + src('components/card-pay-button.tsx');
    for (const k of keys) {
      const viaMsg = ['invalid','failed','photosMissing','photoBad'].includes(k) && all.includes('kl(msg');
      const viaQuoted = all.includes(`'${k}'`);
      expect(all.includes(`kl('${k}'`) || viaMsg || viaQuoted, k).toBe(true);
    }
  });
});

describe('wiring', () => {
  it('the card button sends people who must verify to /kyc', () => {
    const s = src('components/card-pay-button.tsx');
    expect(s).toContain("'kyc_required'");
    expect(s).toContain('href="/kyc"');
  });
  it('the admin panel is a payments tab and a rejection needs a reason', () => {
    expect(src('components/admin/payments-tab.tsx')).toContain('KycPanel');
    expect(src('components/admin/kyc-panel.tsx')).toContain("/api/admin/kyc");
    expect(src('components/admin/kyc-panel.tsx')).toContain('if (!reason) return');
  });
  it('the page only shows the form to people who must verify and can (none or rejected)', () => {
    const s = src('app/kyc/page.tsx');
    expect(s).toContain('me.required');
    expect(s).toContain("me.status === 'none' || me.status === 'rejected'");
  });
});
