// Fractional shares for invest / tokenized listings. A listing with `totalShares` set is sold
// share by share; its price (or payAmountPi) is the value of the WHOLE asset.
// Pure rules: no Firebase, safe for the browser and the server.

export const SHARE_TYPES = ['invest', 'tokenized'];
export const isShareType = (t: unknown) => typeof t === 'string' && SHARE_TYPES.includes(t);
export const MAX_SHARES = 1_000_000;
export const SHARE_HOLD_MS = 15 * 60 * 1000;

export type ShareHold = { paymentId: string; uid: string; count: number; expiresAtMs: number };

// The listing's share count when it is sold by shares, else null (old behaviour: one payment for the whole price).
export function totalSharesOf(d: { type?: unknown; totalShares?: unknown } | null | undefined): number | null {
  if (!d || !isShareType(d.type)) return null;
  const n = Number(d.totalShares);
  return Number.isInteger(n) && n >= 1 && n <= MAX_SHARES ? n : null;
}

export const remainingShares = (d: { totalShares?: unknown; sharesSold?: unknown }) => {
  const total = Number(d.totalShares);
  const sold = Number(d.sharesSold) || 0;
  return Number.isInteger(total) && total >= 1 ? Math.max(0, total - sold) : 0;
};

export function parseShares(raw: unknown, totalShares: number): { ok: true; count: number } | { ok: false; error: string } {
  const n = Number(raw);
  if (raw === '' || raw === null || raw === undefined || !Number.isInteger(n) || n < 1) return { ok: false, error: 'Choose how many shares to buy' };
  if (n > totalShares) return { ok: false, error: 'You cannot buy more shares than the listing has' };
  return { ok: true, count: n };
}

// Price in Pi of `count` shares of an asset worth `totalPi`, rounded UP to 2 decimals.
export function sharesTotal(totalPi: number, totalShares: number, count: number): number | null {
  if (!Number.isFinite(totalPi) || totalPi <= 0 || !Number.isInteger(totalShares) || totalShares < 1) return null;
  if (!Number.isInteger(count) || count < 1 || count > totalShares) return null;
  return Math.ceil((totalPi * count) / totalShares * 100 - 1e-9) / 100;
}

export const ownershipPercent = (count: number, totalShares: number) =>
  totalShares > 0 ? Math.round((count / totalShares) * 10000) / 100 : 0;

export const liveHolds = (holds: ShareHold[], nowMs: number) => holds.filter((h) => h.expiresAtMs > nowMs);

// May this payment take `count` shares? Its own earlier hold and the same user's other unfinished holds never block it.
export function decideShares(
  state: { totalShares: number; sold: number; holds: ShareHold[] },
  req: { paymentId: string; uid: string; count: number },
  nowMs: number
): { ok: true; holds: ShareHold[]; available: number } | { ok: false; code: 'unavailable'; available: number } {
  const others = liveHolds(state.holds, nowMs).filter((h) => h.paymentId !== req.paymentId && h.uid !== req.uid);
  const held = others.reduce((a, h) => a + h.count, 0);
  const available = Math.max(0, state.totalShares - state.sold - held);
  if (req.count > available) return { ok: false, code: 'unavailable', available };
  return { ok: true, holds: others, available };
}

export const SHARE_ERRORS = { unavailable: 'Not enough shares are available right now' };
