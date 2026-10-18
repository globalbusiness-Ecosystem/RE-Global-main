// Turns an error reported by a visitor's browser into a small, safe record (pure; no server imports).
// Nothing personal is kept: no query strings (they can hold ids or tokens), no e-mail addresses, short text only.

export type ClientErrorRecord = { kind: string; message: string; stack: string; page: string };

const KINDS = ['render', 'script', 'promise'];
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ').trim().slice(0, n) : '');
const scrub = (s: string) => s.replace(/\?[^\s)'"]*/g, '').replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]');

// Browser noise that is not a bug in this site.
const NOISE = [/ResizeObserver loop/i, /^Script error\.?$/i, /Non-Error promise rejection/i, /^Load failed$/i, /^Failed to fetch$/i, /^NetworkError/i, /chrome-extension:|moz-extension:/i];
export const isNoise = (message: string): boolean => !message || NOISE.some((r) => r.test(message));

export function normalizeClientError(body: unknown): ClientErrorRecord | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const message = scrub(clip(b.message, 300));
  if (isNoise(message)) return null;
  const stack = scrub(clip(b.stack, 4000)).split('\n').slice(0, 6).map((l) => l.trim().slice(0, 160)).join('\n');
  const kind = typeof b.kind === 'string' && KINDS.includes(b.kind) ? b.kind : 'script';
  const raw = clip(b.page, 200).split(/[?#]/)[0];
  return { kind, message, stack, page: raw.startsWith('/') ? raw.slice(0, 120) : '/' };
}

// Same bug => same signature: numbers and long ids are blanked, and only the first stack frame (without line numbers) counts.
export function errorSignature(rec: ClientErrorRecord): string {
  const msg = rec.message.replace(/[0-9a-f]{8,}/gi, '#').replace(/\d+/g, '#');
  const frame = (rec.stack.split('\n').find((l) => /\s(at|@)\s|@|at /.test(l)) ?? rec.stack.split('\n')[0] ?? '').replace(/:\d+(:\d+)?/g, '').replace(/[0-9a-f]{8,}/gi, '#');
  return `${rec.kind}|${msg}|${frame}`;
}
