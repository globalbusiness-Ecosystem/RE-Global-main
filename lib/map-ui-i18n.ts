import type { NavLanguage } from './nav-i18n';

type Row = Record<NavLanguage, string>;
const r = (en: string, ar: string, fr: string, es: string, pt: string, ur: string, zh: string): Row => ({ en, ar, fr, es, pt, ur, zh });

// The words of the map page controls (listing texts live in map-i18n).
export const MAP_UI = {
  back: r('Back', 'رجوع', 'Retour', 'Atrás', 'Voltar', 'واپس', '返回'),
  all: r('All', 'الكل', 'Tous', 'Todo', 'Tudo', 'سب', '全部'),
  filters: r('Filters', 'تصفية', 'Filtres', 'Filtros', 'Filtros', 'فلٹر', '筛选'),
  properties: r('properties', 'عقار', 'biens', 'propiedades', 'imóveis', 'جائیدادیں', '房产'),
  countries: r('countries', 'دولة', 'pays', 'países', 'países', 'ممالک', '个国家'),
  countriesTitle: r('Countries', 'الدول', 'Pays', 'Países', 'Países', 'ممالک', '国家'),
  regions: r('Regions', 'المناطق', 'Régions', 'Regiones', 'Regiões', 'علاقے', '地区'),
  worldView: r('World view', 'عرض العالم', 'Vue du monde', 'Vista mundial', 'Vista mundial', 'عالمی منظر', '世界视图'),
  maxPrice: r('Max price', 'أقصى سعر', 'Prix max', 'Precio máx.', 'Preço máx.', 'زیادہ سے زیادہ قیمت', '最高价格'),
  reset: r('Reset', 'إعادة ضبط', 'Réinitialiser', 'Restablecer', 'Redefinir', 'ری سیٹ', '重置'),
  close: r('Close', 'إغلاق', 'Fermer', 'Cerrar', 'Fechar', 'بند کریں', '关闭'),
  noResults: r('No properties match your filters.', 'مفيش عقارات تطابق التصفية.', 'Aucun bien ne correspond à vos filtres.', 'Ninguna propiedad coincide con tus filtros.', 'Nenhum imóvel corresponde aos filtros.', 'فلٹر سے کوئی جائیداد نہیں ملی۔', '没有符合筛选条件的房产。'),
  zoomIn: r('Zoom in to see them', 'قرّب لتشوفهم', 'Zoomez pour les voir', 'Acerca para verlos', 'Aproxime para vê-los', 'دیکھنے کے لیے زوم کریں', '放大查看'),
  africa: r('Africa', 'أفريقيا', 'Afrique', 'África', 'África', 'افریقہ', '非洲'),
  asia: r('Asia', 'آسيا', 'Asie', 'Asia', 'Ásia', 'ایشیا', '亚洲'),
  europe: r('Europe', 'أوروبا', 'Europe', 'Europa', 'Europa', 'یورپ', '欧洲'),
  americas: r('Americas', 'الأمريكتان', 'Amériques', 'América', 'Américas', 'امریکہ', '美洲'),
  middleEast: r('Middle East', 'الشرق الأوسط', 'Moyen-Orient', 'Oriente Medio', 'Oriente Médio', 'مشرق وسطیٰ', '中东'),
  searchLabel: r('Search properties', 'ابحث في العقارات', 'Rechercher des biens', 'Buscar propiedades', 'Buscar imóveis', 'جائیدادیں تلاش کریں', '搜索房产'),
} satisfies Record<string, Row>;

export type MapUiKey = keyof typeof MAP_UI;
export const mu = (key: MapUiKey, language: string): string => {
  const row = MAP_UI[key] as Row;
  return row[language as NavLanguage] ?? row.en;
};
