import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ADVISOR_CHROME, ac } from '@/lib/advisor-chrome-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

describe('Aladdin says what is wrong instead of one generic error', () => {
  it('the sign-in and rate-limit messages exist in all 7 languages', () => {
    for (const k of ['authError', 'rateLimit'] as const) {
      for (const l of LANGS) expect(ADVISOR_CHROME[k][l].trim().length).toBeGreaterThan(10);
      for (const l of ['ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const) expect(ADVISOR_CHROME[k][l]).not.toBe(ADVISOR_CHROME[k].en);
    }
    expect(ac('authError', 'fr')).toContain('Pi Browser');
  });
  it('the chat picks the message from the HTTP status', () => {
    const chat = readFileSync('components/ai-advisor-chat.tsx', 'utf8');
    expect(chat).toContain("apiResponse.status === 401 || apiResponse.status === 403 ? ac('authError', language)");
    expect(chat).toContain("apiResponse.status === 429 ? ac('rateLimit', language)");
  });
  it('the route logs only the error name and status, never the error object or the request', () => {
    const route = readFileSync('app/api/claude-advisor/route.ts', 'utf8');
    expect(route).toContain("console.error('[advisor] AI call failed:'");
    expect(route).not.toContain("console.error('[v0] Claude API error:', error)");
  });
});
