import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ESTIMATE_LABELS, estimateLabels, conditionLabel, type EstimateLabelKey } from '@/lib/estimate-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('AI estimate and photo analysis labels', () => {
  it('has every text in all 7 languages, none empty; Arabic, Urdu and Chinese differ from English', () => {
    for (const [key, row] of Object.entries(ESTIMATE_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS) expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(1);
      for (const l of ['ar', 'ur', 'zh'] as const) expect((row as Record<string, string>)[l], `${key}.${l}`).not.toBe((row as Record<string, string>).en);
    }
  });
  it('keeps the old English and Arabic texts', () => {
    expect(estimateLabels('en').disclaimer).toBe('Estimates are AI-generated based on historical data. Always consult with professionals before investing.');
    expect(estimateLabels('ar').refresh).toBe('تحديث التقدير');
    expect(estimateLabels('ar').investNow).toBe('استثمر الآن');
  });
  it('falls back to English and ignores inherited names', () => {
    expect(estimateLabels('xx').title).toBe('AI Price Estimate');
    expect(estimateLabels('constructor').title).toBe('AI Price Estimate');
    expect(estimateLabels('fr').title).toBe('Estimation de prix par IA');
  });
  it('translates the condition the analysis returns and leaves unknown ones alone', () => {
    expect(conditionLabel('Needs Repair', 'es')).toBe('Necesita reparación');
    expect(conditionLabel('Excellent', 'ar')).toBe('ممتازة');
    expect(conditionLabel('Weird', 'fr')).toBe('Weird');
    expect(conditionLabel('toString', 'fr')).toBe('toString');
  });
  it('the disclaimer is shown in every language (never dropped)', () => {
    for (const l of LANGS) expect(estimateLabels(l).disclaimer.length, l).toBeGreaterThan(20);
  });
  it('the photo analysis card uses the labels and no longer pick text by language !== ar', () => {
    for (const f of ['components/property-photo-analysis-card.tsx']) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).toContain('estimateLabels(language)');
      expect(src, f).not.toMatch(/language [!=]== 'ar'|labels\[/);
      for (const k of [...src.matchAll(/currentLabels\.([A-Za-z]+)/g)].map((m) => m[1])) expect(Object.keys(ESTIMATE_LABELS), `${f} ${k}`).toContain(k as EstimateLabelKey);
    }
    expect(readFileSync('components/property-photo-analysis-card.tsx', 'utf8')).toContain('conditionLabel(analysis.condition, language)');
  });
});
