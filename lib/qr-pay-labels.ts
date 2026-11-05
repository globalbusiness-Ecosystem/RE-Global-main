import type { NavLanguage } from './nav-i18n';

// Texts of the property QR code window and of the simple Pi payment button, on top of the shared ones
// (buy-page-labels.ts, property-details-labels.ts, payment-labels.ts), in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const QR_PAY_LABELS = {
  qrTitle: { en: 'Property QR Code', ar: 'رمز الملكية', fr: 'Code QR du bien', es: 'Código QR de la propiedad', pt: 'Código QR do imóvel', ur: 'جائیداد کا QR کوڈ', zh: '房产二维码' },
  location: { en: 'Location', ar: 'الموقع', fr: 'Emplacement', es: 'Ubicación', pt: 'Localização', ur: 'مقام', zh: '位置' },
  bedrooms: { en: 'Bedrooms', ar: 'الغرف', fr: 'Chambres', es: 'Dormitorios', pt: 'Quartos', ur: 'کمرے', zh: '卧室' },
  shareLink: { en: 'Share Link', ar: 'رابط المشاركة', fr: 'Lien de partage', es: 'Enlace para compartir', pt: 'Link de compartilhamento', ur: 'شیئر لنک', zh: '分享链接' },
  copied: { en: 'Copied', ar: 'تم', fr: 'Copié', es: 'Copiado', pt: 'Copiado', ur: 'کاپی ہو گیا', zh: '已复制' },
  copy: { en: 'Copy', ar: 'نسخ', fr: 'Copier', es: 'Copiar', pt: 'Copiar', ur: 'کاپی', zh: '复制' },
  printTitle: { en: 'Print QR Code', ar: 'طباعة رمز QR', fr: 'Imprimer le code QR', es: 'Imprimir código QR', pt: 'Imprimir código QR', ur: 'QR کوڈ پرنٹ کریں', zh: '打印二维码' },
  print: { en: 'Print', ar: 'طباعة', fr: 'Imprimer', es: 'Imprimir', pt: 'Imprimir', ur: 'پرنٹ', zh: '打印' },
  close: { en: 'Close', ar: 'إغلاق', fr: 'Fermer', es: 'Cerrar', pt: 'Fechar', ur: 'بند کریں', zh: '关闭' },
  paySuccess: { en: '✓ Payment Successful', ar: '✓ تمت العملية بنجاح', fr: '✓ Paiement réussi', es: '✓ Pago exitoso', pt: '✓ Pagamento concluído', ur: '✓ ادائیگی کامیاب', zh: '✓ 支付成功' },
  payWithPi: { en: 'Pay with Pi', ar: 'ادفع بـ Pi', fr: 'Payer avec Pi', es: 'Pagar con Pi', pt: 'Pagar com Pi', ur: 'Pi سے ادائیگی کریں', zh: '使用 Pi 支付' },
} satisfies Record<string, Row>;

export type QrPayLabelKey = keyof typeof QR_PAY_LABELS;

export function qrp(key: QrPayLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (QR_PAY_LABELS[key] as Row)[known];
}
