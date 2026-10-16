// Tiny CSV writer for admin exports. Cells that start with = + - @ are prefixed with ' so Excel/Sheets
// never run them as formulas (CSV injection), and quotes/commas/newlines are escaped.
export function csvCell(v: unknown): string {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !(typeof v === 'number' && Number.isFinite(v))) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
