import type { NavLanguage } from './nav-i18n';

// Texts that the Hotel, Investment, Tokenized and International pages use on top of the shared ones (rent-page-labels.ts, buy-page-labels.ts), in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const LISTING_PAGE_LABELS = {
  hotelTitle: { en: 'Hotel Resorts', ar: 'منتجعات الفنادق', fr: 'Hôtels et resorts', es: 'Hoteles y resorts', pt: 'Hotéis e resorts', ur: 'ہوٹل اور ریزورٹس', zh: '酒店度假村' },
  investTitle: { en: 'Investment Properties', ar: 'العقارات الاستثمارية', fr: 'Biens d’investissement', es: 'Propiedades de inversión', pt: 'Imóveis para investimento', ur: 'سرمایہ کاری کی جائیدادیں', zh: '投资房产' },
  tokenizedTitle: { en: 'Tokenized Real Estate', ar: 'العقارات الرمزية', fr: 'Immobilier tokenisé', es: 'Inmuebles tokenizados', pt: 'Imóveis tokenizados', ur: 'ٹوکنائزڈ رئیل اسٹیٹ', zh: '代币化房地产' },
  abroadTitle: { en: 'International Properties', ar: 'العقارات الدولية', fr: 'Biens à l’international', es: 'Propiedades internacionales', pt: 'Imóveis internacionais', ur: 'بین الاقوامی جائیدادیں', zh: '海外房产' },
  tour: { en: 'Tour', ar: 'جولة', fr: 'Visite', es: 'Visita', pt: 'Tour', ur: 'ٹور', zh: '看房' },
  units: { en: 'Units', ar: 'وحدة', fr: 'Unités', es: 'Unidades', pt: 'Unidades', ur: 'یونٹس', zh: '单元' },
  tokenShare: { en: 'Token Share from 1π', ar: 'حصة رمزية من 1π', fr: 'Part en tokens dès 1π', es: 'Participación en tokens desde 1π', pt: 'Fração em tokens a partir de 1π', ur: '1π سے ٹوکن حصہ', zh: '1π 起购代币份额' },
  tokenized: { en: 'Tokenized', ar: 'رمزية', fr: 'Tokenisé', es: 'Tokenizado', pt: 'Tokenizado', ur: 'ٹوکنائزڈ', zh: '已代币化' },
} satisfies Record<string, Row>;

type ListingPageLabelKey = keyof typeof LISTING_PAGE_LABELS;

export function lpl(key: ListingPageLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (LISTING_PAGE_LABELS[key] as Row)[known];
}
