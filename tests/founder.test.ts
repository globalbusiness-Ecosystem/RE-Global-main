import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseFounder, parseLinkedIn, founderVisible, MAX_FOUNDER_BIO } from '@/lib/founder';

const src = (p: string) => readFileSync(p, 'utf8');

describe('founder card data', () => {
  it('keeps clean text, https pictures and LinkedIn only on linkedin.com', () => {
    const f = parseFounder({ name: '  Elsayed  ', photoUrl: 'https://cdn.x.com/a.webp', role: { en: 'Founder', ar: 'المؤسس' }, bio: { ar: 'نبذة\nسطر' }, linkedin: 'https://www.linkedin.com/in/x', website: 'https://x.com' });
    expect(f).toMatchObject({ name: 'Elsayed', photoUrl: 'https://cdn.x.com/a.webp', linkedin: 'https://www.linkedin.com/in/x', enabled: true });
    expect(f.bio?.ar).toContain('\n');
  });
  it('drops anything unsafe', () => {
    const f = parseFounder({ name: 'A', photoUrl: 'javascript:alert(1)', linkedin: 'https://evil.com/linkedin.com', website: 'http://x.com', bio: { en: 'x'.repeat(MAX_FOUNDER_BIO + 1) } });
    expect(f).toMatchObject({ photoUrl: null, linkedin: null, website: null, bio: null });
    expect(parseLinkedIn('https://notlinkedin.com/x')).toBeNull();
    expect(parseLinkedIn('http://www.linkedin.com/x')).toBeNull();
  });
  it('shows to visitors only when on and named', () => {
    expect(founderVisible(parseFounder({}))).toBe(false);
    expect(founderVisible(parseFounder({ name: 'A' }))).toBe(true);
    expect(founderVisible(parseFounder({ name: 'A', enabled: false }))).toBe(false);
  });
});

describe('wiring', () => {
  it('the public card never carries the founder account id', () => {
    const pub = src('app/api/founder/route.ts');
    expect(pub).toContain('getFounder()');
    expect(pub).not.toContain('getFounderUid');
    expect(src('lib/founder.ts')).not.toMatch(/uid/i);
  });
  it('linking needs the admin cookie AND a signed-in account, and only links the caller\'s own', () => {
    const a = src('app/api/admin/founder/route.ts');
    expect((a.match(/isAdminRequest\(req\)/g) ?? []).length).toBe(2);
    expect(a).toContain("guardApi(req, { scope: 'founder-link'");
    expect(a).toContain('user.uid');
    expect(a).toContain('logAdmin');
  });
  it('"am I the founder" needs a signed-in account and answers yes or no only', () => {
    const m = src('app/api/founder/me/route.ts');
    expect(m).toContain('guardApi(req');
    expect(m).toContain('{ isFounder:');
  });
  it('shows on the About page, in the admin About panel, and as a label on the founder\'s own settings page', () => {
    expect(src('components/pages/about-page.tsx')).toContain('<FounderCard');
    expect(src('components/admin/content-tab.tsx')).toContain('<FounderSettings');
    const s = src('components/pages/settings-page.tsx');
    expect(s).toContain('useIsFounder(accessToken)');
    expect(s).toContain('showBadge={level === \'full\' || isFounder}');
  });
});
