import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('360 tour viewer: auto-rotate uses the real Pannellum methods', () => {
  const s = readFileSync('components/vr-property-tour-viewer.tsx', 'utf8');
  it('never calls viewer.setAutoRotate (it does not exist and threw on every click)', () => {
    expect(s).not.toMatch(/viewerRef\.current\??\.setAutoRotate|\bv\??\.setAutoRotate/);
  });
  it('starts and stops the rotation with startAutoRotate / stopAutoRotate', () => {
    expect(s).toContain('startAutoRotate?.(');
    expect(s).toContain('stopAutoRotate?.()');
  });
});
