import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8'));
const pngSize = (p: string) => { const b = readFileSync(p); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

describe('install icons', () => {
  it('every icon in the manifest exists and has the size it claims', () => {
    for (const i of manifest.icons) {
      const f = 'public' + i.src;
      expect(existsSync(f), f).toBe(true);
      if (i.type === 'image/png') expect(pngSize(f).join('x'), f).toBe(i.sizes);
    }
  });
  it('has the 192 and 512 sizes Android needs, plus a maskable one', () => {
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  });
  it('the splash and the address bar use the brand violet', () => {
    expect(manifest.theme_color).toBe('#0d0722');
    expect(manifest.background_color).toBe('#0d0722');
    expect(readFileSync('app/layout.tsx', 'utf8')).toContain('rel="apple-touch-icon"');
  });
});
