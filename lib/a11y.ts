// Small accessibility helpers (pure, so they can be tested without a browser).

const CLOSE_GLYPHS = new Set(['✕', '✖', '×', 'x', 'X', '✗']);

/** A button that only shows a "close" mark (an X icon or glyph) and has no name a screen reader could read. */
export function needsCloseLabel(b: { text: string; hasName: boolean; hasCloseIcon: boolean }): boolean {
  if (b.hasName) return false;
  const t = b.text.trim();
  return CLOSE_GLYPHS.has(t) || (t === '' && b.hasCloseIcon);
}
