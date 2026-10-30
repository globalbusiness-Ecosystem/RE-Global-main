import type { NavLanguage } from './nav-i18n';

// "Report this review" strings. Pure: safe for the browser and the server.
export interface ReviewReportStrings { report: string; sending: string; done: string; error: string }
export const REVIEW_REPORT_I18N: Record<NavLanguage, ReviewReportStrings> = {
  en: { report: 'Report', sending: 'Sending...', done: 'Reported, thank you', error: 'Could not send' },
  ar: { report: 'إبلاغ', sending: 'جاري الإرسال...', done: 'تم الإبلاغ، شكراً', error: 'تعذر الإرسال' },
  fr: { report: 'Signaler', sending: 'Envoi...', done: 'Signalé, merci', error: 'Échec de l’envoi' },
  es: { report: 'Denunciar', sending: 'Enviando...', done: 'Denunciado, gracias', error: 'No se pudo enviar' },
  pt: { report: 'Denunciar', sending: 'Enviando...', done: 'Denunciado, obrigado', error: 'Não foi possível enviar' },
  ur: { report: 'رپورٹ کریں', sending: 'بھیجا جا رہا ہے...', done: 'رپورٹ ہو گئی، شکریہ', error: 'بھیج نہیں سکے' },
  zh: { report: '举报', sending: '发送中...', done: '已举报，谢谢', error: '发送失败' },
};
export const reviewReportStrings = (lang: string): ReviewReportStrings => REVIEW_REPORT_I18N[lang as NavLanguage] ?? REVIEW_REPORT_I18N.en;
