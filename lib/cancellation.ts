import type { NavLanguage } from './nav-i18n';
import { DAY_MS, parseDay } from './booking-rules';

// Cancellation policy of hotel / rental bookings. Pure rules: no Firebase, safe for the browser and the server.
// The guest can cancel until the day before check-in. How much comes back depends on how early:
//   at least freeDays before check-in  -> full refund
//   at least partialDays before        -> partialPct % refund (when partialPct > 0)
//   later                              -> no refund
// Refunds are queued as pending payouts and paid by the admin, like every other refund.

export type CancellationPolicy = { freeDays: number; partialDays: number; partialPct: number };
export const DEFAULT_POLICY: CancellationPolicy = { freeDays: 7, partialDays: 2, partialPct: 50 };
export const MAX_FREE_DAYS = 90;

const int = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? NaN : Number(v));

// Admin input: freeDays 1..90, partialPct 0..99 (0 = no partial tier), partialDays 0..freeDays. null = not acceptable.
export function parsePolicy(raw: unknown): CancellationPolicy | null {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const freeDays = int(r.freeDays);
  const partialDays = int(r.partialDays);
  const partialPct = int(r.partialPct);
  if (![freeDays, partialDays, partialPct].every(Number.isInteger)) return null;
  if (freeDays < 1 || freeDays > MAX_FREE_DAYS) return null;
  if (partialPct < 0 || partialPct > 99) return null;
  if (partialDays < 0 || partialDays > freeDays) return null;
  return { freeDays, partialDays, partialPct };
}
// A stored policy, or the default when it is missing or invalid.
export const policyOf = (raw: unknown): CancellationPolicy => parsePolicy(raw) ?? DEFAULT_POLICY;

const toCents = (n: number) => Math.round(n * 100);

export type RefundQuote = { allowed: boolean; reason?: 'status' | 'started'; days: number; pct: number; refund: number };

// What a guest gets back if they cancel today. Only confirmed stays that have not started can be cancelled.
export function refundQuote(policy: CancellationPolicy, b: { status: unknown; start: string; amount: number }, today: string): RefundQuote {
  const s = parseDay(b.start);
  const t = parseDay(today);
  if (b.status !== 'confirmed' || s === null || t === null) return { allowed: false, reason: 'status', days: 0, pct: 0, refund: 0 };
  const days = Math.round((s - t) / DAY_MS);
  if (days < 1) return { allowed: false, reason: 'started', days, pct: 0, refund: 0 };
  const pct = days >= policy.freeDays ? 100 : policy.partialPct > 0 && days >= policy.partialDays ? policy.partialPct : 0;
  const amount = Number.isFinite(b.amount) && b.amount > 0 ? b.amount : 0;
  return { allowed: true, days, pct, refund: Math.floor((toCents(amount) * pct) / 100) / 100 };
}

export interface CancelStrings {
  policyTitle: string; policyFree: string; policyPartial: string; policyNone: string;
  button: string; refundFull: string; refundPart: string; refundNone: string;
  confirm: string; keep: string; working: string; done: string; error: string;
}
// {days}, {pct} and {amount} are replaced by the numbers.
export const CANCEL_I18N: Record<NavLanguage, CancelStrings> = {
  en: { policyTitle: 'Cancellation policy', policyFree: 'Free cancellation up to {days} days before check-in.', policyPartial: '{pct}% refund up to {days} days before check-in.', policyNone: 'No refund after that.', button: 'Cancel booking', refundFull: 'You will get a full refund of {amount} π.', refundPart: 'You will get {amount} π back ({pct}%).', refundNone: 'This booking is no longer refundable: you will not get a refund.', confirm: 'Confirm cancellation', keep: 'Keep booking', working: 'Cancelling...', done: 'Booking cancelled. The refund (if any) will be sent to you soon.', error: 'Could not cancel. Please try again.' },
  ar: { policyTitle: 'سياسة الإلغاء', policyFree: 'إلغاء مجاني قبل الوصول بـ {days} يوم أو أكتر.', policyPartial: 'استرداد {pct}% قبل الوصول بـ {days} يوم أو أكتر.', policyNone: 'مفيش استرداد بعد كده.', button: 'إلغاء الحجز', refundFull: 'هترجعلك فلوسك كلها: {amount} π.', refundPart: 'هيرجعلك {amount} π ({pct}%).', refundNone: 'الحجز ده مبقاش قابل للاسترداد: مش هيرجعلك فلوس.', confirm: 'تأكيد الإلغاء', keep: 'خليني على الحجز', working: 'جاري الإلغاء...', done: 'الحجز اتلغى. الاسترداد (لو فيه) هيتبعتلك قريب.', error: 'ماقدرناش نلغي الحجز. جرّب تاني.' },
  fr: { policyTitle: 'Conditions d’annulation', policyFree: 'Annulation gratuite jusqu’à {days} jours avant l’arrivée.', policyPartial: 'Remboursement de {pct} % jusqu’à {days} jours avant l’arrivée.', policyNone: 'Aucun remboursement ensuite.', button: 'Annuler la réservation', refundFull: 'Vous serez remboursé intégralement : {amount} π.', refundPart: 'Vous récupérerez {amount} π ({pct} %).', refundNone: 'Cette réservation n’est plus remboursable : aucun remboursement.', confirm: 'Confirmer l’annulation', keep: 'Garder la réservation', working: 'Annulation...', done: 'Réservation annulée. Le remboursement éventuel vous sera envoyé bientôt.', error: 'Annulation impossible. Réessayez.' },
  es: { policyTitle: 'Política de cancelación', policyFree: 'Cancelación gratuita hasta {days} días antes de la llegada.', policyPartial: 'Reembolso del {pct}% hasta {days} días antes de la llegada.', policyNone: 'Sin reembolso después.', button: 'Cancelar reserva', refundFull: 'Recibirás el reembolso completo: {amount} π.', refundPart: 'Recibirás {amount} π ({pct}%).', refundNone: 'Esta reserva ya no es reembolsable: no recibirás reembolso.', confirm: 'Confirmar cancelación', keep: 'Mantener reserva', working: 'Cancelando...', done: 'Reserva cancelada. El reembolso (si lo hay) se te enviará pronto.', error: 'No se pudo cancelar. Inténtalo de nuevo.' },
  pt: { policyTitle: 'Política de cancelamento', policyFree: 'Cancelamento gratuito até {days} dias antes do check-in.', policyPartial: 'Reembolso de {pct}% até {days} dias antes do check-in.', policyNone: 'Sem reembolso depois disso.', button: 'Cancelar reserva', refundFull: 'Você receberá o reembolso total: {amount} π.', refundPart: 'Você receberá {amount} π ({pct}%).', refundNone: 'Esta reserva não é mais reembolsável: você não receberá reembolso.', confirm: 'Confirmar cancelamento', keep: 'Manter reserva', working: 'Cancelando...', done: 'Reserva cancelada. O reembolso (se houver) será enviado em breve.', error: 'Não foi possível cancelar. Tente novamente.' },
  ur: { policyTitle: 'منسوخی کی پالیسی', policyFree: 'پہنچنے سے {days} دن پہلے تک مفت منسوخی۔', policyPartial: 'پہنچنے سے {days} دن پہلے تک {pct}% رقم واپس۔', policyNone: 'اس کے بعد کوئی رقم واپس نہیں۔', button: 'بکنگ منسوخ کریں', refundFull: 'آپ کو پوری رقم واپس ملے گی: {amount} π۔', refundPart: 'آپ کو {amount} π واپس ملیں گے ({pct}%)۔', refundNone: 'یہ بکنگ اب قابل واپسی نہیں: رقم واپس نہیں ملے گی۔', confirm: 'منسوخی کی تصدیق کریں', keep: 'بکنگ رکھیں', working: 'منسوخ ہو رہی ہے...', done: 'بکنگ منسوخ ہو گئی۔ رقم واپسی (اگر ہو) جلد بھیج دی جائے گی۔', error: 'منسوخ نہیں ہو سکی۔ دوبارہ کوشش کریں۔' },
  zh: { policyTitle: '取消政策', policyFree: '入住前 {days} 天以上可免费取消。', policyPartial: '入住前 {days} 天以上退还 {pct}%。', policyNone: '之后不予退款。', button: '取消预订', refundFull: '您将获得全额退款：{amount} π。', refundPart: '您将获得 {amount} π 退款（{pct}%）。', refundNone: '此预订已不可退款：您将不会收到退款。', confirm: '确认取消', keep: '保留预订', working: '取消中...', done: '预订已取消。退款（如有）将很快发送给您。', error: '无法取消，请重试。' },
};
export const cancelStrings = (lang: string): CancelStrings => CANCEL_I18N[lang as NavLanguage] ?? CANCEL_I18N.en;
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));

// The policy as one readable text: free tier, optional partial tier, then no refund.
export function policyText(lang: string, p: CancellationPolicy): string {
  const t = cancelStrings(lang);
  const parts = [fill(t.policyFree, { days: p.freeDays })];
  if (p.partialPct > 0 && p.partialDays < p.freeDays) parts.push(fill(t.policyPartial, { pct: p.partialPct, days: Math.max(1, p.partialDays) }));
  parts.push(t.policyNone);
  return parts.join(' ');
}

// What the guest is told before confirming, from the server's quote.
export function refundText(lang: string, q: { pct: number; refund: number }, formatted: string): string {
  const t = cancelStrings(lang);
  if (q.pct >= 100) return fill(t.refundFull, { amount: formatted });
  if (q.pct > 0) return fill(t.refundPart, { amount: formatted, pct: q.pct });
  return t.refundNone;
}
