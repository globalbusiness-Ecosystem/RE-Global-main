import { describe, it, expect } from 'vitest';
import {
  SUGGESTED_QUESTIONS,
  LEGAL_FRAMEWORK,
  MARKET_TRENDS,
  PI_PAYMENTS_GUIDE,
  GENERAL_ADVICE,
  PROPERTY_DATABASE,
} from '@/lib/aladdin-chat-data';

describe('Aladdin chat content', () => {
  it('has the same legal countries in English and Arabic', () => {
    expect(Object.keys(LEGAL_FRAMEWORK.ar).sort()).toEqual(Object.keys(LEGAL_FRAMEWORK.en).sort());
    expect(Object.keys(LEGAL_FRAMEWORK.en).length).toBeGreaterThan(0);
  });
  it('has non-empty text for every country and language', () => {
    for (const lang of ['en', 'ar'] as const) {
      for (const text of Object.values(LEGAL_FRAMEWORK[lang])) expect(String(text).length).toBeGreaterThan(50);
    }
  });
  it('offers suggested questions and guides in both languages', () => {
    for (const lang of ['en', 'ar'] as const) {
      expect(SUGGESTED_QUESTIONS[lang].length).toBeGreaterThan(0);
      expect(MARKET_TRENDS[lang].length).toBeGreaterThan(0);
      expect(PI_PAYMENTS_GUIDE[lang].length).toBeGreaterThan(0);
      expect(GENERAL_ADVICE[lang].length).toBeGreaterThan(0);
    }
  });
  it('has a property list for each budget tier', () => {
    for (const tier of Object.keys(PROPERTY_DATABASE)) {
      expect(Object.keys(PROPERTY_DATABASE).length).toBeGreaterThan(0);
      expect(PROPERTY_DATABASE[tier as keyof typeof PROPERTY_DATABASE]).toBeTruthy();
    }
  });
});
