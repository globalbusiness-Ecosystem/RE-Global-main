import type { NavLanguage } from './nav-i18n';

export interface FxStrings { title: string; note: string; ratesBy: string }

export const FX_I18N: Record<NavLanguage, FxStrings> = {
  en: { title: 'Show prices in my currency', note: 'An estimate only. You always pay in Pi.', ratesBy: 'Rates By Exchange Rate API' },
  ar: { title: 'اعرض الأسعار بعملتي', note: 'تقدير فقط. الدفع دايماً بعملة Pi.', ratesBy: 'أسعار الصرف من Exchange Rate API' },
  fr: { title: 'Afficher les prix dans ma devise', note: 'Estimation uniquement. Vous payez toujours en Pi.', ratesBy: 'Taux fournis par Exchange Rate API' },
  es: { title: 'Mostrar precios en mi moneda', note: 'Solo una estimación. Siempre pagas en Pi.', ratesBy: 'Tipos de cambio de Exchange Rate API' },
  pt: { title: 'Mostrar preços na minha moeda', note: 'Apenas uma estimativa. Você sempre paga em Pi.', ratesBy: 'Taxas de câmbio por Exchange Rate API' },
  ur: { title: 'قیمتیں میری کرنسی میں دکھائیں', note: 'صرف اندازہ ہے۔ ادائیگی ہمیشہ Pi میں ہوتی ہے۔', ratesBy: 'شرحِ تبادلہ: Exchange Rate API' },
  zh: { title: '以我的货币显示价格', note: '仅为估算。您始终以 Pi 支付。', ratesBy: '汇率来源：Exchange Rate API' },
};
