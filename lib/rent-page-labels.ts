import type { NavLanguage } from './nav-i18n';

// Fixed texts of the Rent page (titles, buttons, price period), in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const RENT_PAGE_LABELS = {
  pageTitle: { en: 'Rent Properties', ar: 'استئجار العقارات', fr: 'Louer des biens', es: 'Alquilar propiedades', pt: 'Alugar imóveis', ur: 'جائیدادیں کرائے پر لیں', zh: '租赁房产' },
  pageSubtitle: { en: 'Find your perfect rental home', ar: 'ابحث عن منزل الإيجار المثالي', fr: 'Trouvez votre logement locatif idéal', es: 'Encuentra tu hogar de alquiler ideal', pt: 'Encontre a sua casa de aluguel ideal', ur: 'اپنا بہترین کرائے کا گھر تلاش کریں', zh: '找到理想的租住之家' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...', fr: 'Chargement...', es: 'Cargando...', pt: 'Carregando...', ur: 'لوڈ ہو رہا ہے...', zh: '加载中...' },
  available: { en: '⭐ Available Properties', ar: '⭐ العقارات المتاحة', fr: '⭐ Biens disponibles', es: '⭐ Propiedades disponibles', pt: '⭐ Imóveis disponíveis', ur: '⭐ دستیاب جائیدادیں', zh: '⭐ 可租房产' },
  featured: { en: 'Featured Listings', ar: 'قوائم مميزة', fr: 'Annonces à la une', es: 'Anuncios destacados', pt: 'Anúncios em destaque', ur: 'نمایاں فہرستیں', zh: '精选房源' },
  monthly: { en: 'Monthly', ar: 'شهري', fr: 'Mensuel', es: 'Mensual', pt: 'Mensal', ur: 'ماہانہ', zh: '月租' },
  perMonth: { en: 'month', ar: 'شهريًا', fr: 'mois', es: 'mes', pt: 'mês', ur: 'ماہ', zh: '月' },
  beds: { en: 'Beds', ar: 'غرف', fr: 'Ch.', es: 'Dorm.', pt: 'Quartos', ur: 'کمرے', zh: '卧室' },
  viewOnMap: { en: 'View on Map', ar: 'اعرض على الخريطة', fr: 'Voir sur la carte', es: 'Ver en el mapa', pt: 'Ver no mapa', ur: 'نقشے پر دیکھیں', zh: '在地图上查看' },
  virtualTour: { en: 'Virtual Tour', ar: 'جولة افتراضية', fr: 'Visite virtuelle', es: 'Visita virtual', pt: 'Tour virtual', ur: 'ورچوئل ٹور', zh: '虚拟看房' },
  propertyLocation: { en: 'Property Location', ar: 'موقع العقار', fr: 'Emplacement du bien', es: 'Ubicación de la propiedad', pt: 'Localização do imóvel', ur: 'جائیداد کا مقام', zh: '房产位置' },
} satisfies Record<string, Row>;

type RentPageLabelKey = keyof typeof RENT_PAGE_LABELS;

export function rp(key: RentPageLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (RENT_PAGE_LABELS[key] as Row)[known];
}
