// Recovery of a Pi payment the SDK reports as "incomplete" at sign-in (the app was closed or the network dropped
// after the user paid). Pure planning plus a small client runner that reuses the existing server routes, which are
// all safe to repeat: complete, cancel, contracts/sign and market/settle.

export type IncompletePayment = {
  identifier?: unknown;
  metadata?: { propertyId?: unknown; propertyTitle?: unknown; transactionType?: unknown } | null;
  transaction?: { txid?: unknown } | null;
  status?: { developer_approved?: boolean; developer_completed?: boolean; cancelled?: boolean; user_cancelled?: boolean } | null;
};

export type RecoveryPlan =
  | { action: 'ignore' }
  | { action: 'cancel'; paymentId: string }
  | { action: 'finish'; paymentId: string; txid: string; complete: boolean; resale: boolean; propertyId: string; propertyTitle: string };

const isId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(v);
const isTxid = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9]{16,128}$/.test(v);

// What to do with one incomplete payment:
// - cancelled already, or unreadable: nothing
// - never reached the blockchain (no txid): cancel it so the held dates / shares / listing are released
// - on the blockchain: complete it with Pi if that was missed, then record the sale (contract / transfer)
export function planRecovery(p: IncompletePayment | null | undefined): RecoveryPlan {
  if (!p || !isId(p.identifier)) return { action: 'ignore' };
  const s = p.status ?? {};
  if (s.cancelled || s.user_cancelled) return { action: 'ignore' };
  const txid = p.transaction?.txid;
  if (!isTxid(txid)) return { action: 'cancel', paymentId: p.identifier };
  const m = p.metadata ?? {};
  const resale = m.transactionType === 'resale';
  const propertyId = typeof m.propertyId === 'string' ? m.propertyId : '';
  if (!resale && !propertyId) return { action: 'finish', paymentId: p.identifier, txid, complete: !s.developer_completed, resale, propertyId: '', propertyTitle: '' };
  return {
    action: 'finish', paymentId: p.identifier, txid, complete: !s.developer_completed, resale, propertyId,
    propertyTitle: typeof m.propertyTitle === 'string' ? m.propertyTitle.slice(0, 150) : '',
  };
}

const handled = new Set<string>();

// Browser side. Never throws; returns what it did, for logging.
export async function recoverIncompletePayment(p: IncompletePayment | null | undefined, accessToken: string): Promise<string> {
  const plan = planRecovery(p);
  if (plan.action === 'ignore') return 'ignored';
  if (handled.has(plan.paymentId)) return 'already handled';
  handled.add(plan.paymentId);
  const post = (url: string, body: Record<string, unknown>) =>
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(body) });
  try {
    if (plan.action === 'cancel') {
      const r = await post('/api/payments/cancel', { paymentId: plan.paymentId });
      return r.ok ? 'cancelled' : `cancel failed ${r.status}`;
    }
    if (plan.complete) {
      const r = await post('/api/payments/complete', { paymentId: plan.paymentId, txid: plan.txid });
      if (!r.ok) { handled.delete(plan.paymentId); return `complete failed ${r.status}`; }
    }
    if (!plan.resale && !plan.propertyId) return 'completed (nothing to record)';
    for (let attempt = 1; attempt <= 3; attempt++) {
      const r = plan.resale
        ? await post('/api/market/settle', { paymentId: plan.paymentId, txid: plan.txid })
        : await post('/api/contracts/sign', { propertyId: plan.propertyId, propertyTitle: plan.propertyTitle, paymentId: plan.paymentId, txid: plan.txid });
      if (r.ok) return 'recovered';
      if (r.status < 500 && r.status !== 409) return `record failed ${r.status}`;
      await new Promise((res) => setTimeout(res, 1500 * attempt));
    }
    handled.delete(plan.paymentId);
    return 'record failed after retries';
  } catch {
    handled.delete(plan.paymentId);
    return 'network error';
  }
}
