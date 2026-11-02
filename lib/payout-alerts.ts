import type { SmartAlert } from './smart-alerts';

// Alerts about money the platform owes the user (refunds and resale proceeds), worked out from their own payouts.
// "Paid" stays visible for 30 days; "pending" stays as long as the transfer is pending.
export interface PayoutRow { id: string; kind: string; amount: number; status: string; createdAt?: string | null; paidAt?: string | null }

export const PAID_WINDOW_DAYS = 30;
const DAY_MS = 86_400_000;

const when = (iso: string | null | undefined, fallback: number): number => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : fallback;
};

export function payoutAlerts(payouts: PayoutRow[], nowMs: number): SmartAlert[] {
  const out: SmartAlert[] = [];
  for (const p of payouts) {
    if (!p || typeof p.id !== 'string' || !p.id) continue;
    const amount = Number.isFinite(p.amount) ? p.amount : 0;
    const refund = p.kind === 'refund';
    if (p.status === 'paid') {
      const at = when(p.paidAt ?? p.createdAt, nowMs);
      if (nowMs - at > PAID_WINDOW_DAYS * DAY_MS) continue;
      out.push({
        id: `payout-paid-${p.id}`, type: 'payout', createdAt: new Date(at),
        titleEn: refund ? 'Your refund was sent' : 'Your sale proceeds were sent',
        titleAr: refund ? 'تم تحويل الاسترداد' : 'تم تحويل حصيلة البيع',
        descriptionEn: `${amount} π was transferred to your Pi wallet. Check your wallet.`,
        descriptionAr: `${amount} π اتحوّلت لمحفظتك على Pi. راجع محفظتك.`,
        i18n: { title: refund ? 'refundSentT' : 'saleSentT', description: 'paidD', vars: { amount } },
      });
    } else if (p.status === 'pending') {
      out.push({
        id: `payout-pending-${p.id}`, type: 'payout', createdAt: new Date(when(p.createdAt, nowMs)),
        titleEn: refund ? 'Refund on its way' : 'Sale proceeds on their way',
        titleAr: refund ? 'الاسترداد في الطريق' : 'حصيلة البيع في الطريق',
        descriptionEn: `${amount} π is waiting for the manual transfer from the team.`,
        descriptionAr: `${amount} π مستنية التحويل اليدوي من الفريق.`,
        i18n: { title: refund ? 'refundPendT' : 'salePendT', description: 'pendD', vars: { amount } },
      });
    }
  }
  return out.sort((a, c) => c.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(c.id));
}
