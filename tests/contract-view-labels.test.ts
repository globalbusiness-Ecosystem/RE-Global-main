import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CONTRACT_VIEW_LABELS, cv, kindPartyLabel, kindTitleLabel, contractStatusLabel } from '@/lib/contract-view-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const KINDS = ['sale', 'invest', 'rent', 'hotel'] as const;

describe('contract card labels', () => {
  it('every label exists in all 7 languages and ar/ur/zh differ from English', () => {
    for (const [key, row] of Object.entries(CONTRACT_VIEW_LABELS)) {
      for (const l of LANGS) expect(row[l].trim().length, `${key}.${l}`).toBeGreaterThan(0);
      for (const l of ['ar', 'ur', 'zh'] as const) expect(row[l], `${key}.${l}`).not.toBe(row.en);
    }
  });
  it('the {role} placeholder is in every language of partyA', () => {
    for (const l of LANGS) expect(cv('partyA', l, { role: 'X' })).toContain('X');
    expect(cv('partyA', 'fr', { role: 'Acheteur' })).toBe('Partie A · Acheteur');
  });
  it('hostile or unknown language codes fall back to English', () => {
    for (const l of ['__proto__', 'constructor', 'xx', undefined]) {
      expect(cv('signatures', l as string | undefined)).toBe('Signatures');
      expect(kindPartyLabel('rent', l as string | undefined)).toBe('Tenant');
      expect(kindTitleLabel('hotel', l as string | undefined)).toBe('RE Global — Hotel Stay Contract');
      expect(contractStatusLabel('completed', l as string | undefined)).toBe('completed');
    }
  });
  it('contract kinds have a title and a party word in every language', () => {
    for (const k of KINDS) for (const l of LANGS) {
      expect(kindPartyLabel(k, l).length).toBeGreaterThan(1);
      expect(kindTitleLabel(k, l)).toContain('RE Global');
    }
    expect(kindPartyLabel('sale', 'ar')).toBe('المشتري');
  });
  it('the status word is translated, and an unknown status stays as it is', () => {
    expect(contractStatusLabel('completed', 'fr')).toBe('Terminé');
    expect(contractStatusLabel('completed', 'ar')).not.toBe('completed');
    expect(contractStatusLabel('weird', 'fr')).toBe('weird');
    expect(contractStatusLabel('constructor', 'fr')).toBe('constructor');
  });
});

describe('the contract card uses them', () => {
  const src = readFileSync('components/contract-detail-view.tsx', 'utf8');
  it('has none of the old English-only texts on screen', () => {
    for (const old of ['>Signatures<', '>Linked verification<', ' Download as PDF', 'Verified via Pi payment', 'Not yet signed', 'Full contract text', 'label="Payment ID"', 'label="Public key"']) {
      expect(src, old).not.toContain(old);
    }
  });
  it('reads them through cv()', () => {
    expect(src.match(/cv\('/g)?.length).toBeGreaterThanOrEqual(15);
  });
});
