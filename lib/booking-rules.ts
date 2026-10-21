// Dated bookings for rent (price = per month) and hotel (price = per night) listings.
// Pure rules: no Firebase, safe to import from the browser and the server.

export const BOOKING_TYPES = ['rent', 'hotel'];
export const isBookingType = (t: unknown) => typeof t === 'string' && BOOKING_TYPES.includes(t);
export const HOLD_MS = 15 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const NIGHT_LIMITS: Record<string, { min: number; max: number }> = {
  hotel: { min: 1, max: 60 },
  rent: { min: 30, max: 365 },
};

export type BookingDates = { start: string; end: string; guests?: number };
export type Range = {
  start: string; end: string; paymentId: string; uid: string; username?: string;
  status: 'hold' | 'confirmed'; expiresAtMs?: number;
  /** Dates the admin closed (maintenance, own use): no guest, no payment. */
  block?: boolean; note?: string;
};

// 'YYYY-MM-DD' -> UTC midnight in ms, or null when it is not a real calendar day.
export function parseDay(s: unknown): number | null {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const ms = Date.parse(`${s}T00:00:00Z`);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10) === s ? ms : null;
}

export const dayStart = (nowMs: number) => Math.floor(nowMs / DAY_MS) * DAY_MS;

export type BookingErrorCode = 'invalid' | 'past' | 'min' | 'max';
export type BookingCheck =
  | { ok: true; start: string; end: string; nights: number }
  | { ok: false; error: string; code: BookingErrorCode; limit?: number };

// check-out is the day the guest leaves, so nights = end - start. A start up to one day in the past
// is tolerated because the buyer's local date can be ahead of UTC.
export function validateBooking(type: string, raw: unknown, nowMs: number, opts: { allowPast?: boolean } = {}): BookingCheck {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const s = parseDay(r.start);
  const e = parseDay(r.end);
  const lim = NIGHT_LIMITS[type];
  if (s === null || e === null || !lim) return { ok: false, error: 'Choose valid dates', code: 'invalid' };
  if (!opts.allowPast && s < dayStart(nowMs) - DAY_MS) return { ok: false, error: 'The start date is in the past', code: 'past' };
  const nights = Math.round((e - s) / DAY_MS);
  if (nights < lim.min) return { ok: false, error: `Minimum stay is ${lim.min} night${lim.min > 1 ? 's' : ''}`, code: 'min', limit: lim.min };
  if (nights > lim.max) return { ok: false, error: `Maximum stay is ${lim.max} nights`, code: 'max', limit: lim.max };
  return { ok: true, start: r.start as string, end: r.end as string, nights };
}

// Total in Pi, rounded UP to 2 decimals so the platform never undercharges.
// unitPi is per night (hotel) or per month of 30 nights (rent, charged pro rata).
export function bookingTotal(type: string, unitPi: number, nights: number): number | null {
  if (!Number.isFinite(unitPi) || unitPi <= 0 || !Number.isInteger(nights) || nights <= 0) return null;
  const raw = type === 'rent' ? (unitPi * nights) / 30 : unitPi * nights;
  return Math.ceil(raw * 100 - 1e-9) / 100;
}

// Do two stays collide? Check-out day and next check-in day may be the same day.
export const overlaps = (a: BookingDates, b: BookingDates) => a.start < b.end && b.start < a.end;

// Drop expired holds and stays that already ended.
export function activeRanges(ranges: Range[], nowMs: number): Range[] {
  const today = new Date(dayStart(nowMs) - DAY_MS).toISOString().slice(0, 10);
  return ranges.filter((r) => r.end >= today && !(r.status === 'hold' && (r.expiresAtMs ?? 0) <= nowMs));
}

// May this payment take these dates? Its own earlier hold (same paymentId) and the same
// user's other unfinished holds never block it.
export function decideBooking(
  ranges: Range[],
  req: BookingDates & { paymentId: string; uid: string },
  nowMs: number
): { ok: true; ranges: Range[] } | { ok: false; code: 'unavailable' } {
  const live = activeRanges(ranges, nowMs);
  const kept = live.filter((r) => r.paymentId !== req.paymentId && !(r.status === 'hold' && r.uid === req.uid));
  if (kept.some((r) => overlaps(r, req))) return { ok: false, code: 'unavailable' };
  return { ok: true, ranges: kept };
}

export const BOOKING_ERRORS = { unavailable: 'These dates are no longer available' };

// Admin summary of bookings. Only confirmed stays count as revenue; "review" ones need a manual look.
export function bookingTotals(rows: { status: unknown; amount: number; end: string; nights: number }[], today: string) {
  const confirmed = rows.filter((r) => r.status === 'confirmed');
  return {
    confirmed: confirmed.length,
    upcoming: confirmed.filter((r) => r.end >= today).length,
    nights: confirmed.reduce((n, r) => n + (Number(r.nights) || 0), 0),
    revenue: confirmed.reduce((n, r) => n + Math.round(r.amount * 100), 0) / 100,
    review: rows.filter((r) => r.status === 'review').length,
  };
}

// A booking the admin may cancel (and refund): a confirmed stay, or one held back for review.
export const isCancellableBooking = (status: unknown) => status === 'confirmed' || status === 'review';

// ---- Dates the admin closes on a hotel / rental (maintenance, owner stay, ...) ----
export const BLOCK_MAX_NIGHTS = 365;
export const BLOCK_NOTE_MAX = 120;
export const isBlock = (r: Pick<Range, 'block'>) => r.block === true;

export type BlockCheck = { ok: true; start: string; end: string; nights: number; note: string } | { ok: false; error: string };

// Today or later, check-out after check-in, at most a year. The note is plain text and optional.
export function validateBlock(raw: unknown, nowMs: number): BlockCheck {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const s = parseDay(r.start);
  const e = parseDay(r.end);
  if (s === null || e === null) return { ok: false, error: 'Choose valid dates' };
  if (s < dayStart(nowMs)) return { ok: false, error: 'The start date is in the past' };
  const nights = Math.round((e - s) / DAY_MS);
  if (nights < 1) return { ok: false, error: 'The end date must be after the start date' };
  if (nights > BLOCK_MAX_NIGHTS) return { ok: false, error: `Maximum ${BLOCK_MAX_NIGHTS} nights` };
  const note = typeof r.note === 'string' ? r.note.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, BLOCK_NOTE_MAX) : '';
  return { ok: true, start: r.start as string, end: r.end as string, nights, note };
}

// Closing dates is refused when any live stay or hold already uses them: cancel that booking first.
export function decideBlock(ranges: Range[], req: BookingDates, nowMs: number): { ok: true; ranges: Range[] } | { ok: false; code: 'unavailable' } {
  const live = activeRanges(ranges, nowMs);
  if (live.some((r) => overlaps(r, req))) return { ok: false, code: 'unavailable' };
  return { ok: true, ranges: live };
}
