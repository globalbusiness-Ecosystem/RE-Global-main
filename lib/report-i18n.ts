import type { NavLanguage } from './nav-i18n';
import type { ReportReason } from './listing-report';

export interface ReportStrings {
  open: string; title: string; reason: string; details: string; email: string; send: string; cancel: string; thanks: string; error: string;
  reasons: Record<ReportReason, string>;
}

export const REPORT_I18N: Record<NavLanguage, ReportStrings> = {
  en: { open: 'Report this listing', title: 'Report this listing', reason: 'What is wrong?', details: 'Tell us more (optional)', email: 'Your email, if you want a reply (optional)', send: 'Send report', cancel: 'Cancel', thanks: 'Thank you. We will review your report.', error: 'Could not send the report. Please try again later.',
    reasons: { illegal: 'Illegal content', scam: 'Looks like a scam', misleading: 'Misleading or wrong information', inappropriate: 'Inappropriate content', copyright: 'Copyright or ownership problem', other: 'Something else' } },
  ar: { open: 'بلّغ عن هذا العقار', title: 'بلّغ عن هذا العقار', reason: 'إيه المشكلة؟', details: 'قولنا تفاصيل أكتر (اختياري)', email: 'إيميلك لو عايز ردّ (اختياري)', send: 'ابعت البلاغ', cancel: 'إلغاء', thanks: 'شكراً. هنراجع بلاغك.', error: 'مقدرناش نبعت البلاغ. حاول تاني بعد شوية.',
    reasons: { illegal: 'محتوى مخالف للقانون', scam: 'شكله نصب', misleading: 'معلومات مضللة أو غلط', inappropriate: 'محتوى غير لائق', copyright: 'مشكلة حقوق أو ملكية', other: 'حاجة تانية' } },
  fr: { open: 'Signaler cette annonce', title: 'Signaler cette annonce', reason: 'Quel est le problème ?', details: 'Dites-nous en plus (facultatif)', email: 'Votre e-mail si vous souhaitez une réponse (facultatif)', send: 'Envoyer le signalement', cancel: 'Annuler', thanks: 'Merci. Nous allons examiner votre signalement.', error: "Impossible d'envoyer le signalement. Réessayez plus tard.",
    reasons: { illegal: 'Contenu illégal', scam: 'Ressemble à une arnaque', misleading: 'Information trompeuse ou fausse', inappropriate: 'Contenu inapproprié', copyright: "Problème de droits ou de propriété", other: 'Autre chose' } },
  es: { open: 'Denunciar este anuncio', title: 'Denunciar este anuncio', reason: '¿Cuál es el problema?', details: 'Cuéntanos más (opcional)', email: 'Tu correo si quieres respuesta (opcional)', send: 'Enviar denuncia', cancel: 'Cancelar', thanks: 'Gracias. Revisaremos tu denuncia.', error: 'No se pudo enviar la denuncia. Inténtalo más tarde.',
    reasons: { illegal: 'Contenido ilegal', scam: 'Parece una estafa', misleading: 'Información engañosa o errónea', inappropriate: 'Contenido inapropiado', copyright: 'Problema de derechos o propiedad', other: 'Otra cosa' } },
  pt: { open: 'Denunciar este anúncio', title: 'Denunciar este anúncio', reason: 'Qual é o problema?', details: 'Conte-nos mais (opcional)', email: 'Seu e-mail, se quiser resposta (opcional)', send: 'Enviar denúncia', cancel: 'Cancelar', thanks: 'Obrigado. Vamos analisar sua denúncia.', error: 'Não foi possível enviar a denúncia. Tente mais tarde.',
    reasons: { illegal: 'Conteúdo ilegal', scam: 'Parece golpe', misleading: 'Informação enganosa ou errada', inappropriate: 'Conteúdo impróprio', copyright: 'Problema de direitos ou propriedade', other: 'Outro motivo' } },
  ur: { open: 'اس لسٹنگ کی رپورٹ کریں', title: 'اس لسٹنگ کی رپورٹ کریں', reason: 'مسئلہ کیا ہے؟', details: 'مزید بتائیں (اختیاری)', email: 'جواب چاہیے تو اپنا ای میل لکھیں (اختیاری)', send: 'رپورٹ بھیجیں', cancel: 'منسوخ کریں', thanks: 'شکریہ۔ ہم آپ کی رپورٹ کا جائزہ لیں گے۔', error: 'رپورٹ نہیں بھیجی جا سکی۔ بعد میں کوشش کریں۔',
    reasons: { illegal: 'غیر قانونی مواد', scam: 'دھوکہ لگتا ہے', misleading: 'گمراہ کن یا غلط معلومات', inappropriate: 'نامناسب مواد', copyright: 'حقوق یا ملکیت کا مسئلہ', other: 'کچھ اور' } },
  zh: { open: '举报此房源', title: '举报此房源', reason: '有什么问题？', details: '请补充说明（可选）', email: '如需回复，请留下邮箱（可选）', send: '提交举报', cancel: '取消', thanks: '谢谢，我们会审核您的举报。', error: '无法提交举报，请稍后再试。',
    reasons: { illegal: '违法内容', scam: '疑似诈骗', misleading: '信息误导或错误', inappropriate: '不当内容', copyright: '版权或所有权问题', other: '其他' } },
};
