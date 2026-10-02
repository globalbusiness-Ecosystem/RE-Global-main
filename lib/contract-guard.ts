// Pure validation helpers for /api/contracts/sign (no I/O, easy to unit test).

export const ALLOWED_CONTRACT_TYPES = ['buy', 'rent', 'invest', 'tokenized'] as const;
export type ContractType = (typeof ALLOWED_CONTRACT_TYPES)[number];

const PAYMENT_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;
const TXID_RE = /^[A-Za-z0-9]{16,128}$/;

export function isValidPaymentId(v: unknown): v is string {
  return typeof v === 'string' && PAYMENT_ID_RE.test(v);
}
export function isValidTxid(v: unknown): v is string {
  return typeof v === 'string' && TXID_RE.test(v);
}

// Strip control chars / newlines so a client-supplied string can never inject
// extra clauses into the contract text.
export function cleanText(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

export interface PiPayment {
  identifier?: string;
  user_uid?: string;
  amount?: number;
  metadata?: { propertyId?: unknown; transactionType?: unknown } | null;
  status?: {
    developer_approved?: boolean;
    transaction_verified?: boolean;
    developer_completed?: boolean;
    cancelled?: boolean;
    user_cancelled?: boolean;
  };
  transaction?: { txid?: string } | null;
}

export interface PaymentCheck {
  ok: boolean;
  status?: number;
  error?: string;
  amount?: number;
  type?: ContractType;
}

export function validatePiPayment(
  payment: PiPayment,
  expected: { uid: string; txid: string; propertyId: string }
): PaymentCheck {
  if (!payment.user_uid || payment.user_uid !== expected.uid) {
    return { ok: false, status: 403, error: 'Payment does not belong to this user' };
  }
  const st = payment.status;
  if (
    !st?.developer_approved ||
    !st?.transaction_verified ||
    !st?.developer_completed ||
    st.cancelled ||
    st.user_cancelled
  ) {
    return { ok: false, status: 409, error: 'Payment is not completed' };
  }
  if (!payment.transaction?.txid || payment.transaction.txid !== expected.txid) {
    return { ok: false, status: 400, error: 'Transaction id mismatch' };
  }
  if (String(payment.metadata?.propertyId ?? '') !== expected.propertyId) {
    return { ok: false, status: 400, error: 'Payment was not made for this property' };
  }
  const rawType = payment.metadata?.transactionType === 'hotel' ? 'buy' : payment.metadata?.transactionType;
  if (!ALLOWED_CONTRACT_TYPES.includes(rawType as ContractType)) {
    return { ok: false, status: 400, error: 'Unsupported transaction type' };
  }
  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, status: 400, error: 'Invalid payment amount' };
  }
  return { ok: true, amount, type: rawType as ContractType };
}
