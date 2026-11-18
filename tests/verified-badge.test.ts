import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { kl } from '@/lib/kyc-labels';

const src = (p: string) => readFileSync(p, 'utf8');

describe('verified badge', () => {
  it('is a gold seal with an accessible label in the person\'s language', () => {
    const b = src('components/verified-badge.tsx');
    expect(b.toLowerCase()).toContain('#d4af37');
    expect(b).toContain('role="img"');
    expect(b).toContain("kl('verifiedBadge', language as NavLanguage)");
    expect(kl('verifiedBadge', 'en')).toBe('Verified');
    expect(kl('verifiedBadge', 'ar')).toBe('تم التحقق');
  });
  it('shows next to the name only for fully verified people, and the green header pill is gone', () => {
    expect(src('components/pages/settings-page.tsx')).toMatch(/level === 'full' && <VerifiedBadge/);
    expect(src('components/header.tsx')).not.toContain('verifiedBadge');
  });
});
