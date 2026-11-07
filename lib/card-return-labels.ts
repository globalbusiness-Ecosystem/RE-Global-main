import type { NavLanguage } from './nav-i18n';

// The page people land on after paying by card, in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const CARD_RETURN_LABELS = {
  title: { en: 'Thank you', ar: 'شكرًا لك', fr: 'Merci', es: 'Gracias', pt: 'Obrigado', ur: 'شکریہ', zh: '谢谢' },
  body: { en: 'We are confirming your card payment. Our team will contact you shortly to complete the handover.', ar: 'نقوم بتأكيد دفعتك بالبطاقة. سيتواصل معك فريقنا قريبًا لإتمام التسليم.', fr: 'Nous confirmons votre paiement par carte. Notre équipe vous contactera bientôt pour finaliser la remise.', es: 'Estamos confirmando tu pago con tarjeta. Nuestro equipo te contactará pronto para completar la entrega.', pt: 'Estamos a confirmar o seu pagamento por cartão. A nossa equipa contactá-lo-á em breve para concluir a entrega.', ur: 'ہم آپ کی کارڈ ادائیگی کی تصدیق کر رہے ہیں۔ حوالگی مکمل کرنے کے لیے ہماری ٹیم جلد آپ سے رابطہ کرے گی۔', zh: '我们正在确认您的银行卡付款。我们的团队将很快与您联系以完成交接。' },
  home: { en: 'Back to the platform', ar: 'العودة إلى المنصة', fr: 'Retour à la plateforme', es: 'Volver a la plataforma', pt: 'Voltar à plataforma', ur: 'پلیٹ فارم پر واپس', zh: '返回平台' },
} satisfies Record<string, Row>;

export type CardReturnKey = keyof typeof CARD_RETURN_LABELS;

export function cr(key: CardReturnKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (CARD_RETURN_LABELS[key] as Row)[known];
}
