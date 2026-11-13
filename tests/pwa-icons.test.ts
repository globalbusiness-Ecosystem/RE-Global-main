import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { buildManifest, parseAppIcon, DEFAULT_APP_ICON, DEFAULT_THEME_COLOR } from '@/lib/app-icon';

const src = (p: string) => readFileSync(p, 'utf8');
const pngSize = (p: string) => { const b = readFileSync(p); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const U = 'https://cdn.example.com/';
const four = { icon192: U + 'a.png', icon512: U + 'b.png', maskable512: U + 'c.png', apple180: U + 'd.png' };

describe('built-in install icons', () => {
  it('every built-in icon exists and has the size it claims', () => {
    for (const i of buildManifest(DEFAULT_APP_ICON).icons) {
      const f = 'public' + i.src;
      expect(existsSync(f), f).toBe(true);
      expect(pngSize(f).join('x'), f).toBe(i.sizes);
    }
  });
  it('has the 192 and 512 sizes Android needs, plus a maskable one', () => {
    const icons = buildManifest(DEFAULT_APP_ICON).icons;
    expect(icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });
});

describe('admin-chosen install icon', () => {
  it('uses the saved pictures and colour in the manifest', () => {
    const m = buildManifest(parseAppIcon({ ...four, themeColor: '#112233' }));
    expect(m.icons.map((i) => i.src)).toEqual([U + 'a.png', U + 'b.png', U + 'c.png', U + 'd.png']);
    expect(m.theme_color).toBe('#112233');
    expect(m.background_color).toBe('#112233');
  });
  it('a half set, a non-https address or a bad colour falls back to the built-in values', () => {
    expect(parseAppIcon({ ...four, apple180: 'http://x.com/d.png' }).icon512).toBeNull();
    expect(parseAppIcon({ icon192: U + 'a.png' }).icon192).toBeNull();
    expect(parseAppIcon({ ...four, themeColor: 'red' }).themeColor).toBe(DEFAULT_THEME_COLOR);
    expect(parseAppIcon(null)).toEqual(DEFAULT_APP_ICON);
  });
});

describe('wiring', () => {
  it('the manifest is built by a route (not a static file) and the iPhone icon follows the choice', () => {
    expect(existsSync('public/manifest.json')).toBe(false);
    expect(src('app/manifest.json/route.ts')).toContain('buildManifest');
    expect(src('app/apple-touch-icon/route.ts')).toContain('apple180');
    expect(src('app/layout.tsx')).toContain('href="/apple-touch-icon"');
  });
  it('the admin route is guarded and audited, and sits in the logo tab', () => {
    const r = src('app/api/admin/app-icon/route.ts');
    expect(r.match(/isAdminRequest/g)!.length).toBeGreaterThanOrEqual(3);
    expect(r).toContain("logAdmin('appIcon.update'");
    expect(src('components/admin/properties-tab.tsx')).toContain('AppIconSettings');
  });
});
