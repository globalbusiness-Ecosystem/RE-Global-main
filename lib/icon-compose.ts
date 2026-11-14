// Pure maths for building the install icon from one logo picture (no canvas here, so it can be tested).

export type Box = { x: number; y: number; w: number; h: number };
export type IconMode = 'fill' | 'fit';

/**
 * The part of the picture that really holds the logo: everything that differs from the background around it
 * (transparent corners, or the colour of the top-left corner). A logo with wide empty margins is trimmed so it can fill the icon.
 * Returns the whole picture when nothing clear is found or the logo is almost the whole picture already.
 */
export function contentBox(data: ArrayLike<number>, w: number, h: number, tol = 28): Box {
  const whole = { x: 0, y: 0, w, h };
  if (w < 2 || h < 2 || data.length < w * h * 4) return whole;
  const a0 = data[3];
  const transparent = a0 < 16;
  const ref = [data[0], data[1], data[2]];
  const isContent = (i: number) => {
    const a = data[i + 3];
    if (transparent) return a > 16;
    if (a < 16) return false;
    return Math.max(Math.abs(data[i] - ref[0]), Math.abs(data[i + 1] - ref[1]), Math.abs(data[i + 2] - ref[2])) > tol;
  };
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isContent((y * w + x) * 4)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
  }
  if (x1 < x0 || y1 < y0) return whole;
  const box = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  if (box.w * box.h < w * h * 0.04) return whole; // a speck, not a logo
  if (box.w * box.h > w * h * 0.97) return whole;
  return box;
}

/** Where to draw a picture of srcW×srcH on a px×px icon. "fill" covers the whole icon (like a full-bleed logo), "fit" keeps all of it inside `fraction` of the icon. */
export function placeRect(srcW: number, srcH: number, px: number, mode: IconMode, zoom = 1, fraction = 1): Box {
  const z = Math.min(Math.max(zoom, 1), 2);
  const k = mode === 'fill' ? (px * z) / Math.min(srcW, srcH) : (px * fraction * z) / Math.max(srcW, srcH);
  const w = srcW * k, h = srcH * k;
  return { x: (px - w) / 2, y: (px - h) / 2, w, h };
}

/** The maskable icon must keep the logo inside the centre safe zone (80% of the width), whatever the chosen mode. */
export const MASKABLE_FRACTION = 0.8;

/** A small source picture gets blurry when it is enlarged to 512. */
export const isSmallSource = (w: number, h: number): boolean => Math.min(w, h) < 512;
