import type { NavLanguage } from './nav-i18n';

// Texts of the "Generate QR" button on every property card, in all 7 languages. {price} is filled in by the button.
type Row = Record<NavLanguage, string>;

export const QR_PAYMENT_LABELS = {
  notAvailable: { en: 'Payment system not available', ar: 'نظام الدفع غير متاح', fr: 'Système de paiement indisponible', es: 'Sistema de pago no disponible', pt: 'Sistema de pagamento indisponível', ur: 'ادائیگی کا نظام دستیاب نہیں', zh: '支付系统不可用' },
  success: { en: 'QR Code generated successfully!', ar: 'تم إنشاء رمز QR بنجاح!', fr: 'Code QR généré avec succès !', es: '¡Código QR generado con éxito!', pt: 'Código QR gerado com sucesso!', ur: 'QR کوڈ کامیابی سے بن گیا!', zh: '二维码生成成功！' },
  productNotFound: { en: 'Product not found', ar: 'المنتج غير موجود', fr: 'Produit introuvable', es: 'Producto no encontrado', pt: 'Produto não encontrado', ur: 'پروڈکٹ نہیں ملی', zh: '未找到商品' },
  purchaseCancelled: { en: 'Purchase cancelled', ar: 'تم إلغاء الشراء', fr: 'Achat annulé', es: 'Compra cancelada', pt: 'Compra cancelada', ur: 'خریداری منسوخ ہو گئی', zh: '购买已取消' },
  purchaseError: { en: 'Purchase error', ar: 'خطأ في الشراء', fr: 'Erreur d\'achat', es: 'Error de compra', pt: 'Erro na compra', ur: 'خریداری میں خرابی', zh: '购买出错' },
  paymentFailed: { en: 'Payment failed', ar: 'فشل الدفع', fr: 'Échec du paiement', es: 'Pago fallido', pt: 'Falha no pagamento', ur: 'ادائیگی ناکام ہو گئی', zh: '支付失败' },
  retry: { en: 'Retry', ar: 'إعادة محاولة', fr: 'Réessayer', es: 'Reintentar', pt: 'Tentar novamente', ur: 'دوبارہ کوشش کریں', zh: '重试' },
  generateQR: { en: 'Generate QR', ar: 'إنشاء QR', fr: 'Générer le QR', es: 'Generar QR', pt: 'Gerar QR', ur: 'QR بنائیں', zh: '生成二维码' },
  qrGenerated: { en: 'QR Generated', ar: 'تم إنشاء QR', fr: 'QR généré', es: 'QR generado', pt: 'QR gerado', ur: 'QR بن گیا', zh: '二维码已生成' },
  generateQRPrice: { en: 'Generate QR - {price}', ar: 'إنشاء QR - {price}', fr: 'Générer le QR - {price}', es: 'Generar QR - {price}', pt: 'Gerar QR - {price}', ur: 'QR بنائیں - {price}', zh: '生成二维码 - {price}' },
  generateQRTitle: { en: 'Generate QR Code - {price}', ar: 'إنشاء رمز QR - {price}', fr: 'Générer le code QR - {price}', es: 'Generar código QR - {price}', pt: 'Gerar código QR - {price}', ur: 'QR کوڈ بنائیں - {price}', zh: '生成二维码 - {price}' },
  qrSystem: { en: 'QR System', ar: 'نظام QR', fr: 'Système QR', es: 'Sistema QR', pt: 'Sistema QR', ur: 'QR سسٹم', zh: '二维码系统' },
} satisfies Record<string, Row>;

type QrPaymentKey = keyof typeof QR_PAYMENT_LABELS;

export function qp(key: QrPaymentKey, language: string, price = ''): string {
  const row = QR_PAYMENT_LABELS[key] as Row;
  return (row[language as NavLanguage] ?? row.en).split('{price}').join(price);
}

/** All plain messages for one language (what the button shows and reports). */
export function qrMessages(language: string) {
  return {
    notAvailable: qp('notAvailable', language), success: qp('success', language), productNotFound: qp('productNotFound', language),
    purchaseCancelled: qp('purchaseCancelled', language), purchaseError: qp('purchaseError', language), paymentFailed: qp('paymentFailed', language),
    retry: qp('retry', language), generateQR: qp('generateQR', language), qrGenerated: qp('qrGenerated', language),
  };
}
