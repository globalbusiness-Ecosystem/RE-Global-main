// "AE" -> the UAE flag emoji. Empty string when the code is not two letters.
export function countryFlag(code: unknown): string {
  if (typeof code !== 'string' || !/^[A-Za-z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
