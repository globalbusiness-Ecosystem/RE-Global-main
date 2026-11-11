import type { NavLanguage } from './nav-i18n';

// Labels of the property details window (facts, amenities, agent, buttons), in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const PROPERTY_DETAILS_LABELS = {
  bedrooms: { en: 'Bedrooms', ar: 'غرف النوم', fr: 'Chambres', es: 'Dormitorios', pt: 'Quartos', ur: 'بیڈ رومز', zh: '卧室' },
  bathrooms: { en: 'Bathrooms', ar: 'الحمامات', fr: 'Salles de bain', es: 'Baños', pt: 'Banheiros', ur: 'باتھ رومز', zh: '浴室' },
  area: { en: 'Area', ar: 'المساحة', fr: 'Surface', es: 'Superficie', pt: 'Área', ur: 'رقبہ', zh: '面积' },
  yearBuilt: { en: 'Year Built', ar: 'سنة البناء', fr: 'Année de construction', es: 'Año de construcción', pt: 'Ano de construção', ur: 'تعمیر کا سال', zh: '建造年份' },
  amenities: { en: 'Amenities', ar: 'المرافق', fr: 'Équipements', es: 'Comodidades', pt: 'Comodidades', ur: 'سہولیات', zh: '设施' },
  agent: { en: 'Agent', ar: 'الوكيل', fr: 'Agent', es: 'Agente', pt: 'Corretor', ur: 'ایجنٹ', zh: '经纪人' },
  call: { en: 'Call', ar: 'اتصل', fr: 'Appeler', es: 'Llamar', pt: 'Ligar', ur: 'کال کریں', zh: '致电' },
  email: { en: 'Email', ar: 'بريد', fr: 'E-mail', es: 'Correo', pt: 'E-mail', ur: 'ای میل', zh: '邮件' },
  buyNow: { en: 'Buy Now', ar: 'اشتري الآن', fr: 'Acheter maintenant', es: 'Comprar ahora', pt: 'Comprar agora', ur: 'ابھی خریدیں', zh: '立即购买' },
} satisfies Record<string, Row>;

type PropertyDetailsLabelKey = keyof typeof PROPERTY_DETAILS_LABELS;

export function pd(key: PropertyDetailsLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (PROPERTY_DETAILS_LABELS[key] as Row)[known];
}

/** Listings only carry English and Arabic text: Arabic readers get Arabic, everyone else English (the other one if one is missing). */
export function pickListingText(language: string | undefined, en?: string, ar?: string): string {
  return language === 'ar' ? ar || en || '' : en || ar || '';
}
