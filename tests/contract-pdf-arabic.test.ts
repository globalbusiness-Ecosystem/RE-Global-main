import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('contract PDF and Arabic names', () => {
  const s = readFileSync('components/contract-detail-view.tsx', 'utf8');
  it('a line with Arabic is drawn by the browser as an image (the built-in PDF fonts have no Arabic)', () => {
    expect(s).toContain('const ARABIC = ');
    expect(s).toContain('writeShaped(');
    expect(s).toContain("doc.addImage(c.toDataURL('image/png')");
    expect(s.indexOf('ARABIC.test(text)')).toBeLessThan(s.indexOf("doc.splitTextToSize(text, maxWidth)"));
  });
});
