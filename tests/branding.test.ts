import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DEFAULT_BRANDING, parseBranding, parseLogoUrl } from '@/lib/branding';

const src = (p: string) => readFileSync(p, 'utf8');

describe('logo settings', () => {
  it('accepts only https image addresses', () => {
    expect(parseLogoUrl('https://cdn.example.com/logo.webp')).toBe('https://cdn.example.com/logo.webp');
    expect(parseLogoUrl('http://cdn.example.com/logo.webp')).toBeNull();
    expect(parseLogoUrl('javascript:alert(1)')).toBeNull();
    expect(parseLogoUrl('data:image/png;base64,AAAA')).toBeNull();
    expect(parseLogoUrl('file:///etc/passwd')).toBeNull();
    expect(parseLogoUrl('https://x.com/' + 'a'.repeat(700))).toBeNull();
    expect(parseLogoUrl(42)).toBeNull();
  });
  it('falls back to the built-in animated logo', () => {
    expect(parseBranding(undefined)).toEqual(DEFAULT_BRANDING);
    expect(parseBranding({ logoUrl: 'nope', animated: 'yes' })).toEqual(DEFAULT_BRANDING);
    expect(parseBranding({ logoUrl: 'https://a.co/l.png', animated: false })).toEqual({ logoUrl: 'https://a.co/l.png', animated: false });
  });
  it('only an admin can change it, and everyone can read it', () => {
    expect(src('app/api/admin/branding/route.ts')).toContain('isAdminRequest');
    expect(src('app/api/admin/branding/route.ts')).toContain('logAdmin');
    const pub = src('app/api/brand/route.ts');
    expect(pub).not.toContain('isAdminRequest');
    expect(pub).not.toContain('export async function PUT');
  });
  it('the header, the sign-in pages and the admin panel use the one logo component', () => {
    expect(src('components/header.tsx')).toContain('<BrandLogo');
    expect(src('components/brand-mark.tsx')).toContain('<BrandLogo');
    expect(src('components/admin/properties-tab.tsx')).toContain('<BrandingSettings');
    expect(src('components/admin/branding-settings.tsx')).toContain('aria-label=');
  });
  it('the animation respects reduced motion', () => {
    const css = src('app/globals.css');
    expect(css).toContain('.re-logo-anim');
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{ \.re-logo-anim/);
  });
});
