import type { NavLanguage } from './nav-i18n';

// Texts of the payment button outside the Pi Browser, in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const PAY_METHOD_LABELS = {
  signInToPay: { en: 'Sign in to pay', ar: 'سجّل الدخول للدفع', fr: 'Connectez-vous pour payer', es: 'Inicia sesión para pagar', pt: 'Entre para pagar', ur: 'ادائیگی کے لیے سائن اِن کریں', zh: '登录后支付' },
  cardSoon: { en: 'Card payment coming soon', ar: 'الدفع بالبطاقة قريبًا', fr: 'Paiement par carte bientôt disponible', es: 'Pago con tarjeta próximamente', pt: 'Pagamento por cartão em breve', ur: 'کارڈ سے ادائیگی جلد آ رہی ہے', zh: '银行卡支付即将上线' },
  cardSoonNote: { en: 'For now, open the platform in the Pi Browser to pay with Pi.', ar: 'حاليًا افتح المنصة في متصفح Pi للدفع بعملة Pi.', fr: 'Pour l\'instant, ouvrez la plateforme dans le navigateur Pi pour payer en Pi.', es: 'Por ahora, abre la plataforma en el navegador Pi para pagar con Pi.', pt: 'Por agora, abra a plataforma no navegador Pi para pagar com Pi.', ur: 'فی الحال Pi سے ادائیگی کے لیے پلیٹ فارم Pi براؤزر میں کھولیں۔', zh: '目前请在 Pi 浏览器中打开平台，使用 Pi 支付。' },
} satisfies Record<string, Row>;

export type PayMethodLabelKey = keyof typeof PAY_METHOD_LABELS;

export function pm(key: PayMethodLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (PAY_METHOD_LABELS[key] as Row)[known];
}
