// Turns a browser CSP violation report into a small, safe record (pure; no server imports).
// Browsers send { "csp-report": { "violated-directive", "effective-directive", "blocked-uri", "document-uri", ... } }.

export type CspRecord = { directive: string; blocked: string; page: string };

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, n) : '');

// "https://cdn.example.com/a.js?x=1" -> "cdn.example.com"; "inline", "eval", "data", "blob" stay as they are.
export function blockedSource(uri: unknown): string {
  const s = clip(uri, 300);
  if (!s) return 'inline';
  if (/^(inline|eval|data|blob|self|wasm-eval)$/i.test(s)) return s.toLowerCase();
  try {
    const u = new URL(s);
    if (u.host) return u.host.toLowerCase().slice(0, 100);
    return u.protocol.replace(':', '').toLowerCase() || 'unknown';
  } catch {
    return 'unknown';
  }
}

// The page path only (never the query string, which can hold ids or tokens).
export function pagePath(uri: unknown): string {
  const s = clip(uri, 300);
  try {
    return new URL(s).pathname.slice(0, 120) || '/';
  } catch {
    return '/';
  }
}

export function normalizeCspReport(body: unknown): CspRecord | null {
  const r = (body as { 'csp-report'?: Record<string, unknown> } | null)?.['csp-report'];
  if (!r || typeof r !== 'object') return null;
  const directive = clip(r['effective-directive'] ?? r['violated-directive'], 60).split(' ')[0];
  if (!directive) return null;
  return { directive, blocked: blockedSource(r['blocked-uri']), page: pagePath(r['document-uri']) };
}
