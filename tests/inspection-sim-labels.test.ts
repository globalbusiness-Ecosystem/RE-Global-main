import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SIM_LABELS, sim } from '@/lib/inspection-sim-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('inspection simulation labels', () => {
  it('has the four stages and the title in all 7 languages, differing from English', () => {
    expect(Object.keys(SIM_LABELS).sort()).toEqual(['analysis', 'certify', 'exterior', 'interior', 'live']);
    for (const [key, row] of Object.entries(SIM_LABELS)) {
      expect(Object.keys(row).sort(), key).toEqual([...LANGS].sort());
      for (const l of LANGS.filter((x) => x !== 'en')) {
        expect((row as Record<string, string>)[l].trim().length, `${key}.${l}`).toBeGreaterThan(1);
        expect((row as Record<string, string>)[l], `${key}.${l}`).not.toBe((row as Record<string, string>).en);
      }
    }
  });
  it('falls back to English for an unknown language', () => {
    expect(sim('live', 'xx')).toBe('Live simulation');
    expect(sim('certify', 'zh')).toBe('链上认证');
  });
  it('the scene takes a language and a translated title instead of an isArabic flag', () => {
    const scene = readFileSync('components/InspectionSimulationScene.tsx', 'utf8');
    const page = readFileSync('components/pages/inspections-page.tsx', 'utf8');
    expect(scene).not.toMatch(/isArabic|labelAr|labelEn/);
    expect(page).toContain('propertyTitle={getDemoPropertyTitle(language)}');
    expect(page).not.toMatch(/isArabic/);
  });
});
