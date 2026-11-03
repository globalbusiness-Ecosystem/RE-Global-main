import type { NavLanguage } from './nav-i18n';

// The six tabs of the bottom bar (always on screen) and its error message, in all 7 languages.
type Row = Record<NavLanguage, string>;

export const BOTTOM_NAV_LABELS = {
  home: { en: 'Home', ar: 'الرئيسية', fr: 'Accueil', es: 'Inicio', pt: 'Início', ur: 'ہوم', zh: '首页' },
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم', fr: 'Tableau de bord', es: 'Panel', pt: 'Painel', ur: 'ڈیش بورڈ', zh: '控制台' },
  alerts: { en: 'Alerts', ar: 'التنبيهات', fr: 'Alertes', es: 'Alertas', pt: 'Alertas', ur: 'الرٹس', zh: '提醒' },
  map: { en: 'Map', ar: 'الخريطة', fr: 'Carte', es: 'Mapa', pt: 'Mapa', ur: 'نقشہ', zh: '地图' },
  profile: { en: 'Profile', ar: 'الملف الشخصي', fr: 'Profil', es: 'Perfil', pt: 'Perfil', ur: 'پروفائل', zh: '我的' },
  partners: { en: 'Partners', ar: 'الشركاء', fr: 'Partenaires', es: 'Socios', pt: 'Parceiros', ur: 'شراکت دار', zh: '合作伙伴' },
  error: { en: 'Something went wrong, please try again', ar: 'حدث خطأ، حاول مرة أخرى', fr: 'Une erreur s\'est produite, veuillez réessayer', es: 'Algo salió mal, inténtalo de nuevo', pt: 'Algo deu errado, tente novamente', ur: 'کچھ غلط ہو گیا، دوبارہ کوشش کریں', zh: '出了点问题，请重试' },
} satisfies Record<string, Row>;

export type BottomNavKey = keyof typeof BOTTOM_NAV_LABELS;

export function bn(key: BottomNavKey, language: string): string {
  const row = BOTTOM_NAV_LABELS[key] as Row;
  return Object.prototype.hasOwnProperty.call(row, language) ? row[language as NavLanguage] : row.en;
}
