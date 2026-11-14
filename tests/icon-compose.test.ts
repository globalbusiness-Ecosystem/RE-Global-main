import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { contentBox, placeRect, isSmallSource, MASKABLE_FRACTION } from '@/lib/icon-compose';

// A w×h picture filled with `bg`, with a solid square of `fg` at (x,y,size).
const pic = (w: number, h: number, bg: number[], fg: number[], x: number, y: number, size: number) => {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const inside = i >= x && i < x + size && j >= y && j < y + size;
    d.set(inside ? fg : bg, (j * w + i) * 4);
  }
  return d;
};

describe('contentBox', () => {
  it('finds the logo inside a transparent margin', () => {
    expect(contentBox(pic(100, 100, [0, 0, 0, 0], [255, 200, 0, 255], 20, 30, 40), 100, 100)).toEqual({ x: 20, y: 30, w: 40, h: 40 });
  });
  it('finds the logo inside a solid-colour margin', () => {
    expect(contentBox(pic(100, 100, [30, 16, 74, 255], [234, 187, 65, 255], 10, 10, 60), 100, 100)).toEqual({ x: 10, y: 10, w: 60, h: 60 });
  });
  it('keeps the whole picture when the logo already fills it, when nothing is found, or when it is just a speck', () => {
    const whole = { x: 0, y: 0, w: 100, h: 100 };
    expect(contentBox(pic(100, 100, [0, 0, 0, 255], [255, 255, 255, 255], 0, 0, 99), 100, 100)).toEqual(whole);
    expect(contentBox(pic(100, 100, [5, 5, 5, 255], [5, 5, 5, 255], 0, 0, 0), 100, 100)).toEqual(whole);
    expect(contentBox(pic(100, 100, [0, 0, 0, 0], [255, 0, 0, 255], 50, 50, 3), 100, 100)).toEqual(whole);
  });
});

describe('placeRect', () => {
  it('fill covers the whole icon, centred, even for a wide picture', () => {
    const r = placeRect(200, 100, 512, 'fill');
    expect(r.h).toBe(512);
    expect(r.w).toBe(1024);
    expect(r.x).toBe(-256);
  });
  it('fit keeps everything inside the chosen share of the icon', () => {
    const r = placeRect(200, 100, 512, 'fit', 1, 0.8);
    expect(r.w).toBeCloseTo(409.6);
    expect(r.x).toBeCloseTo(51.2);
  });
  it('zoom only enlarges (1 to 2) and the maskable share stays in the safe zone', () => {
    expect(placeRect(100, 100, 512, 'fill', 0.5).w).toBe(512);
    expect(placeRect(100, 100, 512, 'fill', 9).w).toBe(1024);
    expect(MASKABLE_FRACTION).toBeLessThanOrEqual(0.8);
  });
  it('knows a small source', () => { expect(isSmallSource(300, 800)).toBe(true); expect(isSmallSource(512, 512)).toBe(false); });
});

describe('icon maker wiring', () => {
  const s = readFileSync('components/admin/app-icon-settings.tsx', 'utf8');
  it('trims, fills like a full-bleed logo, keeps the maskable one in the safe zone and previews the round shape', () => {
    expect(s).toContain('contentBox(');
    expect(s).toContain("useState<IconMode>('fill')");
    expect(s).toContain('MASKABLE_FRACTION');
    expect(s).toContain('rounded-full');
    expect(s).toContain("imageSmoothingQuality = 'high'");
  });
});
