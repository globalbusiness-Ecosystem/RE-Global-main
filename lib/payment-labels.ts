import type { NavLanguage } from './nav-i18n';

// Texts of the Pi payment button (shown on every listing card) and its confirmation dialog, in all 7 languages.
// {amount} is filled in by the button.
type Row = Record<NavLanguage, string>;

export const PAYMENT_LABELS = {
  buy: { en: 'Buy', ar: 'شراء', fr: 'Acheter', es: 'Comprar', pt: 'Comprar', ur: 'خریدیں', zh: '购买' },
  rent: { en: 'Rent', ar: 'استئجر', fr: 'Louer', es: 'Alquilar', pt: 'Alugar', ur: 'کرائے پر لیں', zh: '租赁' },
  hotel: { en: 'Book', ar: 'احجز', fr: 'Réserver', es: 'Reservar', pt: 'Reservar', ur: 'بک کریں', zh: '预订' },
  invest: { en: 'Invest', ar: 'استثمر', fr: 'Investir', es: 'Invertir', pt: 'Investir', ur: 'سرمایہ کاری کریں', zh: '投资' },
  tokenized: { en: 'Tokenize', ar: 'رمز', fr: 'Tokeniser', es: 'Tokenizar', pt: 'Tokenizar', ur: 'ٹوکنائز کریں', zh: '代币化' },
  resale: { en: 'Buy shares', ar: 'اشتري الحصص', fr: 'Acheter des parts', es: 'Comprar participaciones', pt: 'Comprar cotas', ur: 'حصص خریدیں', zh: '购买份额' },
  piUnavailable: { en: 'Pi Network not available', ar: 'شبكة Pi غير متاحة', fr: 'Pi Network indisponible', es: 'Pi Network no disponible', pt: 'Pi Network indisponível', ur: 'Pi Network دستیاب نہیں', zh: 'Pi Network 不可用' },
  paidOk: { en: 'Payment of {amount} Pi processed successfully!', ar: 'تم معالجة دفع {amount} Pi بنجاح!', fr: 'Paiement de {amount} Pi traité avec succès !', es: '¡Pago de {amount} Pi procesado con éxito!', pt: 'Pagamento de {amount} Pi processado com sucesso!', ur: '{amount} Pi کی ادائیگی کامیابی سے ہو گئی!', zh: '{amount} Pi 支付处理成功！' },
  purchaseOk: { en: 'Property purchase payment completed successfully!', ar: 'تم إتمام دفع شراء العقار بنجاح!', fr: 'Paiement de l\'achat du bien effectué avec succès !', es: '¡Pago de la compra de la propiedad completado con éxito!', pt: 'Pagamento da compra do imóvel concluído com sucesso!', ur: 'جائیداد کی خریداری کی ادائیگی کامیابی سے مکمل ہو گئی!', zh: '房产购买支付已成功完成！' },
  errorPrefix: { en: 'Error', ar: 'خطأ', fr: 'Erreur', es: 'Error', pt: 'Erro', ur: 'خرابی', zh: '错误' },
  processing: { en: 'Processing...', ar: 'جاري المعالجة...', fr: 'Traitement...', es: 'Procesando...', pt: 'Processando...', ur: 'کارروائی جاری ہے...', zh: '处理中...' },
  success: { en: 'Success!', ar: 'نجح!', fr: 'Réussi !', es: '¡Éxito!', pt: 'Sucesso!', ur: 'کامیاب!', zh: '成功！' },
  confirmTitle: { en: 'Confirm Transaction', ar: 'تأكيد العملية', fr: 'Confirmer la transaction', es: 'Confirmar la transacción', pt: 'Confirmar a transação', ur: 'لین دین کی تصدیق کریں', zh: '确认交易' },
  confirmSub: { en: 'Review and confirm your purchase', ar: 'راجع وأكد عملية الشراء', fr: 'Vérifiez et confirmez votre achat', es: 'Revisa y confirma tu compra', pt: 'Revise e confirme a sua compra', ur: 'اپنی خریداری کا جائزہ لیں اور تصدیق کریں', zh: '请核对并确认您的购买' },
  property: { en: 'Property', ar: 'العقار', fr: 'Bien', es: 'Propiedad', pt: 'Imóvel', ur: 'جائیداد', zh: '房产' },
  txType: { en: 'Transaction Type', ar: 'نوع العملية', fr: 'Type de transaction', es: 'Tipo de transacción', pt: 'Tipo de transação', ur: 'لین دین کی قسم', zh: '交易类型' },
  amount: { en: 'Amount', ar: 'المبلغ', fr: 'Montant', es: 'Importe', pt: 'Valor', ur: 'رقم', zh: '金额' },
  processingPayment: { en: 'Processing payment...', ar: 'جاري معالجة الدفع...', fr: 'Traitement du paiement...', es: 'Procesando el pago...', pt: 'Processando o pagamento...', ur: 'ادائیگی پر کارروائی جاری ہے...', zh: '正在处理支付...' },
  cancel: { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler', es: 'Cancelar', pt: 'Cancelar', ur: 'منسوخ کریں', zh: '取消' },
  done: { en: 'Done', ar: 'تم', fr: 'Terminé', es: 'Hecho', pt: 'Concluído', ur: 'مکمل', zh: '完成' },
  now: { en: 'Now', ar: 'الآن', fr: 'maintenant', es: 'ahora', pt: 'agora', ur: 'ابھی', zh: '现在' },
  secured: { en: 'Your transaction is secured by Pi Network', ar: 'تم تأمين المعاملة بواسطة شبكة Pi', fr: 'Votre transaction est sécurisée par Pi Network', es: 'Tu transacción está protegida por Pi Network', pt: 'A sua transação é protegida pela Pi Network', ur: 'آپ کا لین دین Pi Network سے محفوظ ہے', zh: '您的交易由 Pi Network 保障安全' },
} satisfies Record<string, Row>;

export type PaymentLabelKey = keyof typeof PAYMENT_LABELS;

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;

/** One text in the user's language (English if the language is unknown), with optional {amount}. */
export function pay(key: PaymentLabelKey, language: string | undefined, amount: string | number = ''): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (PAYMENT_LABELS[key] as Row)[known].split('{amount}').join(String(amount));
}
