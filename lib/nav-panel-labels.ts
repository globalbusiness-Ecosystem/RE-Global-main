import type { NavLanguage } from './nav-i18n';

// Texts of the live navigation panel on the map page, in all 7 languages, plus the voice used to speak them.
type Row = Record<NavLanguage, string>;

export const NAV_PANEL_LABELS = {
  routeFail: { en: 'Could not fetch route', ar: 'تعذر جلب المسار', fr: 'Impossible de récupérer l\'itinéraire', es: 'No se pudo obtener la ruta', pt: 'Não foi possível obter a rota', ur: 'راستہ حاصل نہیں ہو سکا', zh: '无法获取路线' },
  noGeo: { en: 'Geolocation not supported', ar: 'المتصفح لا يدعم تحديد الموقع', fr: 'Géolocalisation non prise en charge', es: 'Geolocalización no compatible', pt: 'Geolocalização não suportada', ur: 'جغرافیائی محل وقوع معاون نہیں', zh: '不支持定位' },
  trackFail: { en: 'Could not track your location', ar: 'تعذر تتبع موقعك', fr: 'Impossible de suivre votre position', es: 'No se pudo rastrear tu ubicación', pt: 'Não foi possível rastrear sua localização', ur: 'آپ کا مقام ٹریک نہیں ہو سکا', zh: '无法跟踪你的位置' },
  arrived: { en: 'You have arrived at your destination', ar: 'لقد وصلت إلى وجهتك', fr: 'Vous êtes arrivé à destination', es: 'Has llegado a tu destino', pt: 'Você chegou ao seu destino', ur: 'آپ اپنی منزل پر پہنچ گئے', zh: '你已到达目的地' },
  live: { en: 'Live navigation', ar: 'ملاحة حية', fr: 'Navigation en direct', es: 'Navegación en vivo', pt: 'Navegação ao vivo', ur: 'براہ راست نیویگیشن', zh: '实时导航' },
  voice: { en: 'Voice', ar: 'الصوت', fr: 'Voix', es: 'Voz', pt: 'Voz', ur: 'آواز', zh: '语音' },
  modeDrive: { en: 'Drive', ar: 'سيارة', fr: 'Voiture', es: 'Coche', pt: 'Carro', ur: 'گاڑی', zh: '驾车' },
  modeWalk: { en: 'Walk', ar: 'مشي', fr: 'Marche', es: 'A pie', pt: 'A pé', ur: 'پیدل', zh: '步行' },
  modeBike: { en: 'Bike', ar: 'دراجة', fr: 'Vélo', es: 'Bici', pt: 'Bicicleta', ur: 'سائیکل', zh: '骑行' },
  calculating: { en: 'Calculating route...', ar: 'جاري حساب المسار...', fr: 'Calcul de l\'itinéraire...', es: 'Calculando ruta...', pt: 'Calculando rota...', ur: 'راستہ شمار کیا جا رہا ہے...', zh: '正在计算路线...' },
  remaining: { en: 'Remaining', ar: 'المسافة المتبقية', fr: 'Restant', es: 'Restante', pt: 'Restante', ur: 'باقی', zh: '剩余' },
  min: { en: 'min', ar: 'د', fr: 'min', es: 'min', pt: 'min', ur: 'منٹ', zh: '分钟' },
  eta: { en: 'ETA', ar: 'الوقت المتوقع', fr: 'Arrivée estimée', es: 'Llegada estimada', pt: 'Chegada estimada', ur: 'متوقع وقت', zh: '预计到达' },
  next: { en: 'Next', ar: 'التالي', fr: 'Suivant', es: 'Siguiente', pt: 'Próximo', ur: 'اگلا', zh: '下一步' },
} satisfies Record<string, Row>;

export type NavPanelKey = keyof typeof NAV_PANEL_LABELS;

export function np(key: NavPanelKey, language: string): string {
  const row = NAV_PANEL_LABELS[key] as Row;
  return row[language as NavLanguage] ?? row.en;
}

// BCP-47 tag for the browser's speech engine. Unknown languages use English.
export const SPEECH_LANG: Record<NavLanguage, string> = { en: 'en-US', ar: 'ar-SA', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', ur: 'ur-PK', zh: 'zh-CN' };

export function speechLang(language: string): string {
  return SPEECH_LANG[language as NavLanguage] ?? 'en-US';
}

// The route service writes its turn-by-turn text in Arabic or English only, so that text is shown and spoken in
// one of those two (Arabic for Arabic users, English for everyone else).
export function routeTextLang(language: string): 'ar' | 'en' {
  return language === 'ar' ? 'ar' : 'en';
}
