import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  START_QUESTIONS, CONTRACT_QUESTIONS, SUGGEST_HEADING, CONTRACT_FOLLOWUP_HEADING,
  suggestHeading, contractHeading, startQuestions, contractQuestions,
} from '@/lib/advisor-suggest-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('advisor suggested questions in 7 languages', () => {
  it('every language has the same number of non-empty questions', () => {
    for (const l of LANGS) {
      expect(START_QUESTIONS[l].length).toBe(START_QUESTIONS.en.length);
      expect(CONTRACT_QUESTIONS[l].length).toBe(CONTRACT_QUESTIONS.en.length);
      [...START_QUESTIONS[l], ...CONTRACT_QUESTIONS[l]].forEach((q) => expect(q.trim().length).toBeGreaterThan(3));
      expect(SUGGEST_HEADING[l].length).toBeGreaterThan(3);
      expect(CONTRACT_FOLLOWUP_HEADING[l].length).toBeGreaterThan(3);
    }
  });
  it('non-English languages are really translated', () => {
    for (const l of LANGS.filter((x) => x !== 'en')) {
      START_QUESTIONS[l].forEach((q, i) => expect(q).not.toBe(START_QUESTIONS.en[i]));
      CONTRACT_QUESTIONS[l].forEach((q, i) => expect(q).not.toBe(CONTRACT_QUESTIONS.en[i]));
      expect(SUGGEST_HEADING[l]).not.toBe(SUGGEST_HEADING.en);
    }
  });
  it('falls back to English for unknown or hostile language codes', () => {
    for (const bad of [undefined, '', 'xx', '__proto__', 'constructor']) {
      expect(startQuestions(bad)).toBe(START_QUESTIONS.en);
      expect(contractQuestions(bad)).toBe(CONTRACT_QUESTIONS.en);
      expect(suggestHeading(bad)).toBe(SUGGEST_HEADING.en);
      expect(contractHeading(bad)).toBe(CONTRACT_FOLLOWUP_HEADING.en);
    }
    expect(startQuestions('fr')).toBe(START_QUESTIONS.fr);
  });
  it('the chat uses the accessors, not the old ar/en-only list, and shows contract questions only after an analysis', () => {
    const chat = readFileSync('components/ai-advisor-chat.tsx', 'utf8');
    expect(chat).toContain('startQuestions(language)');
    expect(chat).toContain('contractQuestions(language)');
    expect(chat).not.toContain("SUGGESTED_QUESTIONS[language");
    expect(chat).toMatch(/hasContractContext\(messages\) && messages\[messages\.length - 1\]\?\.role === 'assistant'/);
  });
});
