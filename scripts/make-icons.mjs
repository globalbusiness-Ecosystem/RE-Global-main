// Draws the install icons (phone home screen, browser tab) from public/icon.svg. Run once after changing the drawing:
//   node scripts/make-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/icon.svg', import.meta.url));
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname;
const sizes = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-maskable-512.png', 512], // the picture sits inside the centre safe zone, so round or squircle masks never cut it
  ['apple-icon.png', 180],
  ['icon-dark-32x32.png', 32],
  ['icon-light-32x32.png', 32],
];
for (const [name, px] of sizes) {
  await sharp(svg, { density: 384 }).resize(px, px).png({ compressionLevel: 9 }).toFile(out(name));
  console.log('wrote', name);
}
