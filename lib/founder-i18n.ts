import type { NavLanguage } from './nav-i18n';

type L7 = Record<NavLanguage, string>;
export const FOUNDER_UI = {
  title: { en: 'Meet the founder', ar: 'تعرّف على المؤسس', fr: 'Rencontrez le fondateur', es: 'Conoce al fundador', pt: 'Conheça o fundador', ur: 'بانی سے ملیں', zh: '认识创始人' },
  chip: { en: 'Founder', ar: 'المؤسس', fr: 'Fondateur', es: 'Fundador', pt: 'Fundador', ur: 'بانی', zh: '创始人' },
  linkedin: { en: 'LinkedIn', ar: 'لينكدإن', fr: 'LinkedIn', es: 'LinkedIn', pt: 'LinkedIn', ur: 'LinkedIn', zh: 'LinkedIn' },
  website: { en: 'Website', ar: 'الموقع', fr: 'Site web', es: 'Sitio web', pt: 'Site', ur: 'ویب سائٹ', zh: '网站' },
} satisfies Record<string, L7>;

export const founderText = (d: L7, language: string): string => d[language as NavLanguage] || d.en;
