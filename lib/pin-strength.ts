// Is the admin PIN hard enough to guess? (pure; the PIN itself never leaves the server)
// Strong = 10+ characters, or 8+ with both letters and digits; and never just a few repeated characters.
export function isStrongPin(pin: string | undefined | null): boolean {
  if (typeof pin !== 'string') return false;
  const p = pin.trim();
  if (new Set(p).size < 5) return false;
  if (p.length >= 10) return true;
  return p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
}
