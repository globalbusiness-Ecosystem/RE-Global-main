import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

// The admin panel uses the platform's own colour tokens (app/globals.css), never its own hex colours or grey scale,
// so a brand change in one place reaches the whole admin. The wrappers force the platform's dark look.
const files = [
  ...readdirSync('components/admin').filter((f) => f.endsWith('.tsx')).map((f) => `components/admin/${f}`),
  'app/admin/page.tsx', 'app/admin/security/page.tsx',
];

describe('admin colours', () => {
  it('has no hard-coded hex colours or grey-scale text and backgrounds', () => {
    const bad: string[] = [];
    for (const f of files) {
      const t = readFileSync(f, 'utf8');
      if (/#[0-9a-fA-F]{3,8}\b/.test(t.replace(/&#\d+;|href="#"/g, ''))) bad.push(`${f}: hex`);
      if (/\b(?:text|bg|border)-(?:gray|neutral|zinc|slate)-\d+/.test(t)) bad.push(`${f}: grey scale`);
      if (/\btext-white\b/.test(t)) bad.push(`${f}: text-white`);
    }
    expect(bad).toEqual([]);
  });
  it('the gold of the admin is the platform accent', () => {
    expect(readFileSync('components/admin/admin-ui.tsx', 'utf8')).toContain("export const GOLD = 'var(--accent)'");
  });
  it('the admin screens force the platform dark look whatever the visitor theme is', () => {
    const p = readFileSync('app/admin/page.tsx', 'utf8');
    expect((p.match(/className="dark /g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(readFileSync('app/admin/security/page.tsx', 'utf8')).toContain('className="dark ');
  });
});
