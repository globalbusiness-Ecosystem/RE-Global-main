import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const src = (p: string) => readFileSync(p, 'utf8');

describe('gold badge on approved partners', () => {
  it('shows after the company name in the directory, the project cards and the project page', () => {
    for (const f of ['partner-directory', 'project-showcase', 'project-detail-modal']) {
      const s = src(`components/partners/${f}.tsx`);
      expect(s, f).toContain("import { VerifiedBadge } from '@/components/verified-badge'");
      expect(s, f).toContain('<VerifiedBadge');
    }
  });
  it('shows on a partner\'s own page only once they are approved', () => {
    expect(src('components/partners/partner-dashboard.tsx')).toMatch(/profile\.status === 'approved' && <VerifiedBadge/);
  });
  it('the public lists only hold team-approved partners', () => {
    expect(src('app/api/partners/directory/route.ts')).toMatch(/approved/);
    expect(src('app/api/partners/showcase/route.ts')).toMatch(/approved/);
  });
});
