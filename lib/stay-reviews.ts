import type { NavLanguage } from './nav-i18n';

// Reviews of finished stays (hotel / rental). Pure rules: no Firebase, safe for the browser and the server.
// Only a guest whose confirmed stay has ended can review it, once per booking.

export const REVIEW_COMMENT_MAX = 500;
export const REVIEW_LIST_MAX = 20;

export type ReviewCheck = { ok: true; rating: number; comment: string } | { ok: false; error: string };

export function validateReview(raw: unknown): ReviewCheck {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rating = typeof r.rating === 'number' ? r.rating : Number(r.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: 'Choose a rating from 1 to 5' };
  const comment = typeof r.comment === 'string' ? r.comment.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, REVIEW_COMMENT_MAX) : '';
  return { ok: true, rating, comment };
}

// A stay can be reviewed once it is confirmed and the check-out day has come (dates are YYYY-MM-DD, compared as text).
export const canReview = (b: { status: unknown; end: string }, today: string) => b.status === 'confirmed' && b.end <= today;

// Public name: the first two letters only, so a guest is never identifiable from the review.
export function maskName(username: unknown): string {
  const s = typeof username === 'string' ? username.replace(/^@/, '').trim() : '';
  return s ? Array.from(s).slice(0, 2).join('') + '***' : '***';
}

export function summarize(rows: { rating: number }[]): { count: number; avg: number } {
  const ok = rows.filter((r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5);
  if (!ok.length) return { count: 0, avg: 0 };
  const sum = ok.reduce((a, r) => a + r.rating, 0);
  return { count: ok.length, avg: Math.round((sum / ok.length) * 10) / 10 };
}

export interface ReviewStrings {
  title: string; count: string; rate: string; placeholder: string; submit: string; sending: string;
  thanks: string; reviewed: string; button: string; error: string; verified: string;
}
// {n} is replaced by the number of reviews.
export const REVIEW_I18N: Record<NavLanguage, ReviewStrings> = {
  en: { title: 'Guest reviews', count: '{n} reviews', rate: 'Rate your stay', placeholder: 'Tell others about your stay (optional)', submit: 'Send review', sending: 'Sending...', thanks: 'Thanks for your review!', reviewed: 'You reviewed this stay', button: 'Review this stay', error: 'Could not send the review. Please try again.', verified: 'Verified stay' },
  ar: { title: 'تقييمات الضيوف', count: '{n} تقييم', rate: 'قيّم إقامتك', placeholder: 'احكي للناس عن إقامتك (اختياري)', submit: 'ابعت التقييم', sending: 'جاري الإرسال...', thanks: 'شكراً على تقييمك!', reviewed: 'أنت قيّمت الإقامة دي', button: 'قيّم الإقامة', error: 'ماقدرناش نبعت التقييم. جرّب تاني.', verified: 'إقامة موثّقة' },
  fr: { title: 'Avis des voyageurs', count: '{n} avis', rate: 'Notez votre séjour', placeholder: 'Parlez de votre séjour (facultatif)', submit: 'Envoyer l’avis', sending: 'Envoi...', thanks: 'Merci pour votre avis !', reviewed: 'Vous avez déjà noté ce séjour', button: 'Noter ce séjour', error: 'Impossible d’envoyer l’avis. Réessayez.', verified: 'Séjour vérifié' },
  es: { title: 'Opiniones de huéspedes', count: '{n} opiniones', rate: 'Valora tu estancia', placeholder: 'Cuenta a otros cómo fue tu estancia (opcional)', submit: 'Enviar opinión', sending: 'Enviando...', thanks: '¡Gracias por tu opinión!', reviewed: 'Ya valoraste esta estancia', button: 'Valorar esta estancia', error: 'No se pudo enviar la opinión. Inténtalo de nuevo.', verified: 'Estancia verificada' },
  pt: { title: 'Avaliações de hóspedes', count: '{n} avaliações', rate: 'Avalie a sua estadia', placeholder: 'Conte aos outros como foi a estadia (opcional)', submit: 'Enviar avaliação', sending: 'Enviando...', thanks: 'Obrigado pela sua avaliação!', reviewed: 'Você já avaliou esta estadia', button: 'Avaliar esta estadia', error: 'Não foi possível enviar a avaliação. Tente novamente.', verified: 'Estadia verificada' },
  ur: { title: 'مہمانوں کے جائزے', count: '{n} جائزے', rate: 'اپنے قیام کو ریٹ کریں', placeholder: 'دوسروں کو اپنے قیام کے بارے میں بتائیں (اختیاری)', submit: 'جائزہ بھیجیں', sending: 'بھیجا جا رہا ہے...', thanks: 'آپ کے جائزے کا شکریہ!', reviewed: 'آپ اس قیام کا جائزہ دے چکے ہیں', button: 'اس قیام کا جائزہ دیں', error: 'جائزہ نہیں بھیجا جا سکا۔ دوبارہ کوشش کریں۔', verified: 'تصدیق شدہ قیام' },
  zh: { title: '住客评价', count: '{n} 条评价', rate: '为您的住宿评分', placeholder: '和其他人分享您的住宿体验（可选）', submit: '提交评价', sending: '提交中...', thanks: '感谢您的评价！', reviewed: '您已评价过此次住宿', button: '评价此次住宿', error: '无法提交评价，请重试。', verified: '已验证的住宿' },
};
export const reviewStrings = (lang: string): ReviewStrings => REVIEW_I18N[lang as NavLanguage] ?? REVIEW_I18N.en;
export const reviewCount = (lang: string, n: number) => reviewStrings(lang).count.replace('{n}', String(n));
export const starsText = (n: number) => '★'.repeat(Math.max(0, Math.min(5, Math.round(n)))) + '☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(n))));
