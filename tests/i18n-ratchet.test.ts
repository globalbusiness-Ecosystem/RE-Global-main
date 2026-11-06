import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// A ratchet: files that still have text written for Arabic/English only may not get more of it, and no new file may start.
// When you translate one of these files, lower its number here (or remove it) so the gain is kept.
const PATTERN = /\b(language|lang|currentLang|detectedLang) *(===|!==) *'(ar|en)' *\?|\b(isArabic|isAr) *\?/g;

const BUDGET: Record<string, number> = {
  'app/country/[code]/page.tsx': 1,
  'app/p/[id]/page.tsx': 1,
  'components/admin/texts-editor.tsx': 5,
  'components/advanced-analysis-dashboard.tsx': 2,
  'components/advanced-payment-button.tsx': 14,
  'components/ai-advisor-chat.tsx': 6,
  'components/ai-advisor-voice-chat.tsx': 5,
  'components/auth-otp-component.tsx': 2,
  'components/legal-notice.tsx': 2,
  'components/pages/partners-page.tsx': 2,
  'components/pages/properties-page.tsx': 8,
  'components/pages/properties-showcase-page.tsx': 4,
  'components/property-image-upload.tsx': 1,
  'components/property-tour-selector.tsx': 4,
  'components/qr-codes-manager.tsx': 5,
  'components/search-filter.tsx': 15,
  'components/simple-pi-payment-button.tsx': 1,
  'components/unified-payment-button.tsx': 1,
};

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

describe('i18n ratchet: no new Arabic/English-only text', () => {
  const counts: Record<string, number> = {};
  for (const file of [...walk('app'), ...walk('components')]) {
    const n = (readFileSync(file, 'utf8').match(PATTERN) ?? []).length;
    if (n > 0) counts[file.split('\\').join('/')] = n;
  }

  it('no file outside the list has Arabic/English-only text', () => {
    const fresh = Object.keys(counts).filter((f) => !(f in BUDGET));
    expect(fresh, `translate these with a labels file (see lib/home-labels.ts): ${fresh.join(', ')}`).toEqual([]);
  });
  it('no listed file has more of it than before', () => {
    for (const [file, max] of Object.entries(BUDGET)) {
      expect(counts[file] ?? 0, file).toBeLessThanOrEqual(max);
    }
  });
  it('every file on the list still exists', () => {
    for (const file of Object.keys(BUDGET)) expect(() => statSync(file), file).not.toThrow();
  });
});
