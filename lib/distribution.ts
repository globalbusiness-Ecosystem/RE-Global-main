// Distribution of a property's net income to its Share holders: the arithmetic only (no database, no payment).
//
// The rules, fixed here so the admin, the tests and the contract wording agree:
//  - A period is a range of whole calendar days (UTC), both ends included.
//  - A Share counts for a day if the holder held it at the END of that day. A seller who sells during a day does not
//    earn that day, the buyer does. This is the "day settlement" when a Share changes hands inside the period.
//  - A holder's weight is their share-days. The denominator is ALL the Shares of the Property times the days, so the part
//    that belongs to Shares nobody holds (not yet sold) is never paid out. It stays unallocated.
//  - Amounts are cut down to 4 decimals, never rounded up, so the total paid can never exceed the net amount.
//    The cut-off dust also stays unallocated.
//  - The platform fee is taken first, in basis points, also cut down.
//  - A ledger that puts more Shares in holders' hands than the Property has is refused: the data is wrong, not the maths.

export const DAY_MS = 86_400_000;
export const MAX_DAYS = 400;
export const MAX_FEE_PCT = 50;
const UNIT = 10_000; // 4 decimals

export type LedgerEvent = { uid: string; username: string; at: number; delta: number };
export type Period = { startDay: number; endDay: number; days: number; start: string; end: string };

export const dayOf = (ms: number): number => Math.floor(ms / DAY_MS);
const dayText = (d: number): string => new Date(d * DAY_MS).toISOString().slice(0, 10);

/** 'YYYY-MM-DD' to 'YYYY-MM-DD', both days included. */
export function parsePeriod(start: unknown, end: unknown): { ok: true; period: Period } | { ok: false; error: string } {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof start !== 'string' || typeof end !== 'string' || !re.test(start) || !re.test(end)) return { ok: false, error: 'Dates must look like 2026-01-31' };
  const s = Date.parse(`${start}T00:00:00Z`);
  const e = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(s) || !Number.isFinite(e) || dayText(dayOf(s)) !== start || dayText(dayOf(e)) !== end) return { ok: false, error: 'Invalid date' };
  const startDay = dayOf(s);
  const endDay = dayOf(e) + 1;
  const days = endDay - startDay;
  if (days < 1) return { ok: false, error: 'The end date is before the start date' };
  if (days > MAX_DAYS) return { ok: false, error: `The period is longer than ${MAX_DAYS} days` };
  return { ok: true, period: { startDay, endDay, days, start, end } };
}

export type Holder = { uid: string; username: string; shareDays: number; sharesAtEnd: number };

/** Share-days of every holder inside the period, from the ledger of purchases (+) and transfers (+/-). */
export function shareDays(events: LedgerEvent[], p: Pick<Period, 'startDay' | 'endDay'>): Holder[] {
  const byUid = new Map<string, LedgerEvent[]>();
  for (const e of events) {
    if (!e.uid || !Number.isFinite(e.at) || !Number.isInteger(e.delta) || e.delta === 0) continue;
    const l = byUid.get(e.uid) ?? [];
    l.push(e);
    byUid.set(e.uid, l);
  }
  const out: Holder[] = [];
  for (const [uid, list] of byUid) {
    list.sort((a, b) => a.at - b.at);
    let cur = 0;
    let total = 0;
    let last = p.startDay;
    for (const ev of list) {
      const d = dayOf(ev.at);
      if (d >= p.endDay) break;
      if (d > last) { total += Math.max(0, cur) * (d - last); last = d; }
      cur += ev.delta;
    }
    total += Math.max(0, cur) * (p.endDay - last);
    if (total > 0) out.push({ uid, username: list[list.length - 1].username, shareDays: total, sharesAtEnd: Math.max(0, cur) });
  }
  return out.sort((a, b) => b.shareDays - a.shareDays || a.uid.localeCompare(b.uid));
}

const units = (n: number): number => Math.round(n * UNIT);
const fromUnits = (u: number | bigint): number => Number(u) / UNIT;

export type RunInput = { gross: unknown; feePct: unknown; totalShares: number; period: Period; holders: Holder[] };
export type Row = { uid: string; username: string; shareDays: number; sharesAtEnd: number; amount: number };
export type Run = { gross: number; feePct: number; fee: number; net: number; allocated: number; unallocated: number; days: number; totalShares: number; rows: Row[] };

export function computeRun(i: RunInput): { ok: true; run: Run } | { ok: false; error: string } {
  const gross = Number(i.gross);
  if (!Number.isFinite(gross) || gross <= 0 || gross > 1e9) return { ok: false, error: 'The income must be a positive amount' };
  const pct = i.feePct === '' || i.feePct === undefined || i.feePct === null ? 0 : Number(i.feePct);
  if (!Number.isFinite(pct) || pct < 0 || pct > MAX_FEE_PCT) return { ok: false, error: `The fee must be between 0 and ${MAX_FEE_PCT}%` };
  if (!Number.isInteger(i.totalShares) || i.totalShares < 1) return { ok: false, error: 'The property has no Shares' };

  const grossU = units(gross);
  const feeU = Number((BigInt(grossU) * BigInt(Math.round(pct * 100))) / BigInt(10000));
  const netU = grossU - feeU;
  const den = BigInt(i.totalShares) * BigInt(i.period.days);
  const sumSd = i.holders.reduce((a, h) => a + h.shareDays, 0);
  if (BigInt(sumSd) > den) return { ok: false, error: 'The ledger holds more Shares than the property has' };

  const rows: Row[] = [];
  let paidU = 0;
  for (const h of i.holders) {
    const u = Number((BigInt(netU) * BigInt(h.shareDays)) / den);
    if (u <= 0) continue;
    paidU += u;
    rows.push({ uid: h.uid, username: h.username, shareDays: h.shareDays, sharesAtEnd: h.sharesAtEnd, amount: fromUnits(u) });
  }
  return { ok: true, run: { gross: fromUnits(grossU), feePct: pct, fee: fromUnits(feeU), net: fromUnits(netU), allocated: fromUnits(paidU), unallocated: fromUnits(netU - paidU), days: i.period.days, totalShares: i.totalShares, rows } };
}

export type ApprovalRow = Row & { reason?: string };

/** Who gets a payout record now (identity verified) and who is held back. A held holder keeps their amount in the run; nothing is created for them. */
export function splitByKyc(rows: Row[], approved: ReadonlySet<string>): { pay: Row[]; held: ApprovalRow[] } {
  const pay: Row[] = [];
  const held: ApprovalRow[] = [];
  for (const r of rows) {
    if (!r.uid || r.uid.includes('/') || r.uid.length > 100) held.push({ ...r, reason: 'invalid account' });
    else if (!approved.has(r.uid)) held.push({ ...r, reason: 'identity not verified' });
    else pay.push(r);
  }
  return { pay, held };
}

/** One payout record per holder per run: the id makes a repeated approval harmless. */
export const payoutIdFor = (runId: string, uid: string): string => `dist-${runId}-${uid}`;

/** The admin must type the net amount of the run before it is approved. */
export const confirmationOk = (typed: unknown, net: number): boolean => {
  const t = typeof typed === 'number' ? typed : Number(String(typed ?? '').trim().replace(/,/g, ''));
  return Number.isFinite(t) && Math.round(t * UNIT) === Math.round(net * UNIT);
};

/** True when two periods (inclusive 'YYYY-MM-DD' ranges) share a day. */
export const periodsOverlap = (a: { start: string; end: string }, b: { start: string; end: string }): boolean => a.start <= b.end && b.start <= a.end;
