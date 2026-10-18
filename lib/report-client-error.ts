// Browser side: tells the server a page crashed. At most 5 reports per page load, each different one once.
const sent = new Set<string>();
let total = 0;

export function reportClientError(kind: 'render' | 'script' | 'promise', err: unknown): void {
  try {
    if (typeof window === 'undefined' || total >= 5) return;
    const e = err as { message?: unknown; stack?: unknown } | null;
    const message = typeof err === 'string' ? err : typeof e?.message === 'string' ? e.message : '';
    if (!message) return;
    const key = `${kind}|${message}`;
    if (sent.has(key)) return;
    sent.add(key); total += 1;
    const body = JSON.stringify({ kind, message, stack: typeof e?.stack === 'string' ? e.stack : '', page: window.location.pathname });
    if (!(navigator.sendBeacon && navigator.sendBeacon('/api/client-error', new Blob([body], { type: 'application/json' })))) {
      void fetch('/api/client-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // reporting must never cause another error
  }
}
