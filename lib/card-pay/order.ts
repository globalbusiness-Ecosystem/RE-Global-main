import type { Currency, WebhookEvent } from './provider';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface CardOrder {
  id: string;
  uid: string;
  propertyId?: string;
  amountMinor: number;
  currency: Currency;
  status: OrderStatus;
  providerRef?: string;
  /** Ids of provider notifications already applied (repeats are ignored). */
  seenEvents: string[];
}

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'failed'],
  failed: ['paid'], // the customer may retry on the same order
  paid: ['refunded'],
  refunded: [],
};

export const canMove = (from: OrderStatus, to: OrderStatus): boolean => NEXT[from].includes(to);

/** Converts a price in major units (e.g. 12.5) to whole minor units, refusing anything that is not a clean amount. */
export function toMinor(major: number): number | null {
  if (!Number.isFinite(major) || major <= 0 || major > 100_000_000) return null;
  const minor = Math.round(major * 100);
  return Math.abs(minor / 100 - major) < 1e-9 ? minor : null;
}

export type ApplyResult = { ok: true; order: CardOrder; changed: boolean } | { ok: false; reason: 'mismatch' | 'transition' };

/**
 * Applies a verified provider notification. The amount and currency must equal what we charged (the price comes
 * from our server, never from the browser), a repeated notification changes nothing, and a status can only move forward.
 */
export function applyEvent(order: CardOrder, ev: WebhookEvent): ApplyResult {
  if (ev.orderId !== order.id || ev.amountMinor !== order.amountMinor || ev.currency !== order.currency) {
    return { ok: false, reason: 'mismatch' };
  }
  if (order.seenEvents.includes(ev.eventId)) return { ok: true, order, changed: false };
  if (order.status === ev.status) return { ok: true, order: { ...order, seenEvents: [...order.seenEvents, ev.eventId] }, changed: false };
  if (!canMove(order.status, ev.status)) return { ok: false, reason: 'transition' };
  return { ok: true, changed: true, order: { ...order, status: ev.status, providerRef: ev.providerRef, seenEvents: [...order.seenEvents, ev.eventId] } };
}
