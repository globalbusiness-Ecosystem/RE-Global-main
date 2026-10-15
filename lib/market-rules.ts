// Resale of fractional shares between users. Pure rules: no Firebase, safe for browser and server.
// Money is handled in integer cents so rounding never drifts.

export const RESALE_FEE_PCT = 2;
export const LISTING_RESERVE_MS = 15 * 60 * 1000;
export const MAX_PRICE_PER_SHARE = 1_000_000_000;

const toCents = (n: number) => Math.round(n * 100);

// Price of `shares` shares at `pricePerShare` Pi, rounded UP to 2 decimals (never undercharges).
export function listingTotal(shares: number, pricePerShare: number): number | null {
  if (!Number.isInteger(shares) || shares < 1 || !Number.isFinite(pricePerShare) || pricePerShare <= 0) return null;
  return Math.ceil(shares * pricePerShare * 100 - 1e-9) / 100;
}

// Admin summary of resales: only confirmed sales count towards volume and fees; "review" ones are flagged.
export function marketTotals(transfers: { status: unknown; amount: number; fee: number }[], open: number) {
  const confirmed = transfers.filter((t) => t.status === 'confirmed');
  return {
    open,
    sold: confirmed.length,
    review: transfers.filter((t) => t.status === 'review').length,
    volume: confirmed.reduce((n, t) => n + toCents(t.amount), 0) / 100,
    fees: confirmed.reduce((n, t) => n + toCents(t.fee), 0) / 100,
  };
}

export const MAX_FEE_PCT = 20;
// Admin-entered fee percent: 0..20, at most 2 decimals. null = not acceptable.
export function parseFeePct(raw: unknown): number | null {
  const n = raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '') ? NaN : Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > MAX_FEE_PCT) return null;
  return Math.round(n * 100) / 100;
}
// A stored fee percent, or the default when it is missing or out of range.
export const feePctOf = (raw: unknown): number => parseFeePct(raw) ?? RESALE_FEE_PCT;

// Platform fee (rounded UP) and what the seller is owed.
export function feeSplit(total: number, pct = RESALE_FEE_PCT): { fee: number; proceeds: number } {
  const c = toCents(total);
  const fee = Math.max(0, Math.ceil((c * pct) / 100 - 1e-9)) + 0;
  return { fee: fee / 100, proceeds: Math.max(0, c - fee) / 100 };
}

export function parseListingInput(
  raw: { shares?: unknown; pricePerShare?: unknown },
  available: number
): { ok: true; shares: number; pricePerShare: number } | { ok: false; error: string } {
  const shares = Number(raw.shares);
  const price = Number(raw.pricePerShare);
  if (!Number.isInteger(shares) || shares < 1) return { ok: false, error: 'Choose how many shares to sell' };
  if (shares > available) return { ok: false, error: `You can sell at most ${available} shares` };
  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE_PER_SHARE) return { ok: false, error: 'Enter a valid price per share' };
  const pricePerShare = Math.round(price * 100) / 100;
  if (pricePerShare <= 0) return { ok: false, error: 'Price per share is too small' };
  return { ok: true, shares, pricePerShare };
}

// Shares a user owns of a property: bought from the platform, plus bought from others, minus sold to others.
export const ownedShares = (bought: number, received: number, sold: number) => Math.max(0, bought + received - sold);
// Shares the user can still put on sale (owned minus what is already listed).
export const availableToList = (owned: number, listed: number) => Math.max(0, owned - listed);

export type ListingState = {
  status?: unknown; sellerUid?: unknown;
  reservedBy?: unknown; reservedPaymentId?: unknown; reservedUntilMs?: unknown;
};

// May this buyer start paying for the listing now?
export function decideBuy(l: ListingState, buyerUid: string, nowMs: number): { ok: true } | { ok: false; code: 'gone' | 'own' | 'reserved' } {
  if (l.status !== 'open') return { ok: false, code: 'gone' };
  if (l.sellerUid === buyerUid) return { ok: false, code: 'own' };
  const until = Number(l.reservedUntilMs) || 0;
  if (l.reservedBy && l.reservedBy !== buyerUid && until > nowMs) return { ok: false, code: 'reserved' };
  return { ok: true };
}

// A payment finished: should the listing be marked sold to it?
export function decideSettle(l: { status?: unknown; soldPaymentId?: unknown }, paymentId: string): 'mark' | 'already' | 'conflict' {
  if (l.status === 'open') return 'mark';
  if (l.status === 'sold') return l.soldPaymentId === paymentId ? 'already' : 'conflict';
  return 'conflict'; // cancelled
}

export const MARKET_ERRORS = {
  gone: 'This listing is no longer available',
  own: 'You cannot buy your own listing',
  reserved: 'Another buyer is paying for this listing right now, try again in a few minutes',
};

export interface ResalePayment {
  user_uid?: string;
  amount?: number;
  metadata?: { transactionType?: unknown; listingId?: unknown } | null;
  status?: { developer_approved?: boolean; transaction_verified?: boolean; developer_completed?: boolean; cancelled?: boolean; user_cancelled?: boolean };
  transaction?: { txid?: string } | null;
}

// Was there a real, completed Pi payment by THIS buyer for exactly this listing and amount?
export function validateResalePayment(
  p: ResalePayment,
  e: { uid: string; txid: string; listingId: string; expectedAmount: number }
): { ok: true } | { ok: false; status: number; error: string } {
  if (!p.user_uid || p.user_uid !== e.uid) return { ok: false, status: 403, error: 'Payment does not belong to this user' };
  const s = p.status;
  if (!s?.developer_approved || !s?.transaction_verified || !s?.developer_completed || s.cancelled || s.user_cancelled) {
    return { ok: false, status: 409, error: 'Payment is not completed' };
  }
  if (!p.transaction?.txid || p.transaction.txid !== e.txid) return { ok: false, status: 400, error: 'Transaction id mismatch' };
  if (p.metadata?.transactionType !== 'resale' || String(p.metadata?.listingId ?? '') !== e.listingId) {
    return { ok: false, status: 400, error: 'Payment was not made for this listing' };
  }
  if (!Number.isFinite(Number(p.amount)) || toCents(Number(p.amount)) !== toCents(e.expectedAmount)) {
    return { ok: false, status: 400, error: 'Unexpected payment amount' };
  }
  return { ok: true };
}
