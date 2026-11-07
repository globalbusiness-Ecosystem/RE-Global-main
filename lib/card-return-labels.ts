import type { NavLanguage } from './nav-i18n';

// The page people land on after paying by card, in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const CARD_RETURN_LABELS = {
  title: { en: 'Thank you', ar: 'شكرًا لك', fr: 'Merci', es: 'Gracias', pt: 'Obrigado', ur: 'شکریہ', zh: '谢谢' },
  body: { en: 'We are confirming your card payment. Our team will contact you shortly to complete the handover.', ar: 'نقوم بتأكيد دفعتك بالبطاقة. سيتواصل معك فريقنا قريبًا لإتمام التسليم.', fr: 'Nous confirmons votre paiement par carte. Notre équipe vous contactera bientôt pour finaliser la remise.', es: 'Estamos confirmando tu pago con tarjeta. Nuestro equipo te contactará pronto para completar la entrega.', pt: 'Estamos a confirmar o seu pagamento por cartão. A nossa equipa contactá-lo-á em breve para concluir a entrega.', ur: 'ہم آپ کی کارڈ ادائیگی کی تصدیق کر رہے ہیں۔ حوالگی مکمل کرنے کے لیے ہماری ٹیم جلد آپ سے رابطہ کرے گی۔', zh: '我们正在确认您的银行卡付款。我们的团队将很快与您联系以完成交接。' },
  home: { en: 'Back to the platform', ar: 'العودة إلى المنصة', fr: 'Retour à la plateforme', es: 'Volver a la plataforma', pt: 'Voltar à plataforma', ur: 'پلیٹ فارم پر واپس', zh: '返回平台' },
  simNote: { en: 'Test mode: this is a pretend payment page.', ar: 'وضع التجربة: هذه صفحة دفع تجريبية.', fr: 'Mode test : ceci est une fausse page de paiement.', es: 'Modo de prueba: esta es una página de pago simulada.', pt: 'Modo de teste: esta é uma página de pagamento simulada.', ur: 'ٹیسٹ موڈ: یہ ادائیگی کا فرضی صفحہ ہے۔', zh: '测试模式：这是一个模拟支付页面。' },
  simPaid: { en: 'Simulate successful payment', ar: 'محاكاة دفع ناجح', fr: 'Simuler un paiement réussi', es: 'Simular pago exitoso', pt: 'Simular pagamento com sucesso', ur: 'کامیاب ادائیگی کی نقل', zh: '模拟支付成功' },
  simFailed: { en: 'Simulate failed payment', ar: 'محاكاة دفع فاشل', fr: 'Simuler un paiement échoué', es: 'Simular pago fallido', pt: 'Simular pagamento falhado', ur: 'ناکام ادائیگی کی نقل', zh: '模拟支付失败' },
  simDone: { en: 'Done. The order was updated.', ar: 'تم. جرى تحديث الطلب.', fr: 'Terminé. La commande a été mise à jour.', es: 'Listo. El pedido se actualizó.', pt: 'Concluído. A encomenda foi atualizada.', ur: 'ہو گیا۔ آرڈر اپ ڈیٹ ہو گیا۔', zh: '完成，订单已更新。' },
  simError: { en: 'Something went wrong. Try again.', ar: 'حدث خطأ. حاول مرة أخرى.', fr: 'Une erreur est survenue. Réessayez.', es: 'Algo salió mal. Inténtalo de nuevo.', pt: 'Ocorreu um erro. Tente novamente.', ur: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔', zh: '出错了，请重试。' },
} satisfies Record<string, Row>;

export type CardReturnKey = keyof typeof CARD_RETURN_LABELS;

export function cr(key: CardReturnKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (CARD_RETURN_LABELS[key] as Row)[known];
}
