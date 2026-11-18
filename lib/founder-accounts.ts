// Which accounts belong to the founder (a web account and a Pi account can both be his). Server-side use only.
export const MAX_FOUNDER_ACCOUNTS = 5;
export function parseFounderUids(data: unknown): string[] {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const raw: unknown[] = [...(Array.isArray(d.uids) ? d.uids : []), d.uid];
  const out: string[] = [];
  for (const u of raw) if (typeof u === 'string' && u.length > 0 && u.length <= 200 && !out.includes(u)) out.push(u);
  return out.slice(0, MAX_FOUNDER_ACCOUNTS);
}
