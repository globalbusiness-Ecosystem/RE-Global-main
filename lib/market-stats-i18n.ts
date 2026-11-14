import type { NavLanguage } from './nav-i18n';
import { SEO_LANGS } from './seo-i18n';

type Row = Record<NavLanguage, string>;
const r = (en: string, ar: string, fr: string, es: string, pt: string, ur: string, zh: string): Row => ({ en, ar, fr, es, pt, ur, zh });

export const STATS_TEXT = {
  title: r('Market Analytics', 'تحليلات السوق', 'Analyses du marché', 'Análisis de mercado', 'Análise de mercado', 'مارکیٹ اینالیٹکس', '市场分析'),
  subtitle: r('Live figures from the platform: listings, countries and completed deals.', 'أرقام حيّة من المنصة: العقارات والدول والصفقات المكتملة.', 'Chiffres en direct de la plateforme : annonces, pays et transactions conclues.', 'Cifras en vivo de la plataforma: anuncios, países y operaciones completadas.', 'Números ao vivo da plataforma: anúncios, países e negócios concluídos.', 'پلیٹ فارم کے براہِ راست اعداد: لسٹنگز، ممالک اور مکمل سودے۔', '平台实时数据：房源、国家和已完成交易。'),
  listings: r('Listings', 'العقارات المعروضة', 'Annonces', 'Anuncios', 'Anúncios', 'لسٹنگز', '房源'),
  available: r('available', 'متاح', 'disponibles', 'disponibles', 'disponíveis', 'دستیاب', '可售'),
  sold: r('sold', 'مباع', 'vendus', 'vendidos', 'vendidos', 'فروخت', '已售'),
  countries: r('Countries', 'الدول', 'Pays', 'Países', 'Países', 'ممالک', '国家'),
  countriesNote: r('with at least one listing', 'بها عقار واحد على الأقل', 'avec au moins une annonce', 'con al menos un anuncio', 'com pelo menos um anúncio', 'کم از کم ایک لسٹنگ کے ساتھ', '至少有一个房源'),
  deals: r('Completed deals', 'الصفقات المكتملة', 'Transactions conclues', 'Operaciones completadas', 'Negócios concluídos', 'مکمل سودے', '已完成交易'),
  last12: r('last 12 months', 'آخر 12 شهرًا', '12 derniers mois', 'últimos 12 meses', 'últimos 12 meses', 'پچھلے 12 مہینے', '过去12个月'),
  median: r('Median sale price', 'الوسيط لسعر البيع', 'Prix de vente médian', 'Precio de venta mediano', 'Preço de venda mediano', 'فروخت کی درمیانی قیمت', '销售价格中位数'),
  basedOn: r('based on {n} listings', 'بناءً على {n} عقارًا', 'sur {n} annonces', 'sobre {n} anuncios', 'com base em {n} anúncios', '{n} لسٹنگز کی بنیاد پر', '基于 {n} 个房源'),
  chartDeals: r('Completed deals per month', 'الصفقات المكتملة شهريًا', 'Transactions conclues par mois', 'Operaciones completadas por mes', 'Negócios concluídos por mês', 'ماہانہ مکمل سودے', '每月已完成交易'),
  chartTypes: r('Listings by type', 'العقارات حسب النوع', 'Annonces par type', 'Anuncios por tipo', 'Anúncios por tipo', 'قسم کے لحاظ سے لسٹنگز', '按类型的房源'),
  chartCountries: r('Top countries by listings', 'أعلى الدول من حيث العقارات', 'Premiers pays par annonces', 'Principales países por anuncios', 'Principais países por anúncios', 'لسٹنگز کے لحاظ سے سرفہرست ممالک', '房源最多的国家'),
  tablePrices: r('Prices by type', 'الأسعار حسب النوع', 'Prix par type', 'Precios por tipo', 'Preços por tipo', 'قسم کے لحاظ سے قیمتیں', '按类型的价格'),
  volume: r('Sales volume (12 months)', 'حجم المبيعات (12 شهرًا)', 'Volume des ventes (12 mois)', 'Volumen de ventas (12 meses)', 'Volume de vendas (12 meses)', 'فروخت کا حجم (12 مہینے)', '销售额（12个月）'),
  colType: r('Type', 'النوع', 'Type', 'Tipo', 'Tipo', 'قسم', '类型'),
  colCount: r('Listings', 'العدد', 'Annonces', 'Anuncios', 'Anúncios', 'تعداد', '数量'),
  colMedian: r('Median', 'الوسيط', 'Médiane', 'Mediana', 'Mediana', 'درمیانی', '中位数'),
  colRange: r('Range', 'النطاق', 'Fourchette', 'Rango', 'Faixa', 'رینج', '范围'),
  noData: r('Not enough data yet. Figures appear as listings and deals are added.', 'لا توجد بيانات كافية بعد. ستظهر الأرقام مع إضافة العقارات وإتمام الصفقات.', 'Pas encore assez de données. Les chiffres apparaîtront avec les annonces et les transactions.', 'Aún no hay datos suficientes. Las cifras aparecerán a medida que se añadan anuncios y operaciones.', 'Ainda não há dados suficientes. Os números aparecem conforme anúncios e negócios são adicionados.', 'ابھی کافی ڈیٹا نہیں۔ لسٹنگز اور سودے شامل ہونے پر اعداد نظر آئیں گے۔', '数据尚不足。随着房源和交易增加，数据将显示在这里。'),
  note: r('Only visible listings and completed contracts are counted. Amounts in different currencies are never added together.', 'تُحتسب العقارات الظاهرة والعقود المكتملة فقط. لا تُجمع المبالغ بعملات مختلفة معًا.', 'Seuls les annonces visibles et les contrats conclus sont comptés. Les montants en devises différentes ne sont jamais additionnés.', 'Solo se cuentan anuncios visibles y contratos completados. Nunca se suman importes de distintas monedas.', 'Só contam anúncios visíveis e contratos concluídos. Valores em moedas diferentes nunca são somados.', 'صرف نظر آنے والی لسٹنگز اور مکمل معاہدے شمار ہوتے ہیں۔ مختلف کرنسیوں کی رقوم کبھی جمع نہیں کی جاتیں۔', '仅统计可见房源和已完成合同。不同币种的金额不会相加。'),
  loading: r('Loading…', 'جارٍ التحميل…', 'Chargement…', 'Cargando…', 'Carregando…', 'لوڈ ہو رہا ہے…', '加载中…'),
  loadError: r('Could not load the figures.', 'تعذّر تحميل الأرقام.', 'Impossible de charger les chiffres.', 'No se pudieron cargar las cifras.', 'Não foi possível carregar os números.', 'اعداد لوڈ نہیں ہو سکے۔', '无法加载数据。'),
  retry: r('Retry', 'إعادة المحاولة', 'Réessayer', 'Reintentar', 'Tentar de novo', 'دوبارہ کوشش کریں', '重试'),
  buy: r('For sale', 'للبيع', 'À vendre', 'En venta', 'À venda', 'برائے فروخت', '出售'),
  rent: r('Rent', 'إيجار', 'Location', 'Alquiler', 'Aluguel', 'کرایہ', '出租'),
  hotel: r('Hotels', 'فنادق', 'Hôtels', 'Hoteles', 'Hotéis', 'ہوٹل', '酒店'),
  invest: r('Invest', 'استثمار', 'Investir', 'Invertir', 'Investir', 'سرمایہ کاری', '投资'),
  tokenized: r('Shares', 'حصص', 'Parts', 'Participaciones', 'Cotas', 'حصص', '份额'),
  offplan: r('Off-plan', 'على الخريطة', 'Sur plan', 'Sobre plano', 'Na planta', 'زیرِ تعمیر', '期房'),
  abroad: r('Abroad', 'بالخارج', 'À l’étranger', 'En el extranjero', 'No exterior', 'بیرونِ ملک', '海外'),
  other: r('Other', 'أخرى', 'Autre', 'Otro', 'Outro', 'دیگر', '其他'),
} satisfies Record<string, Row>;

export type StatsTextKey = keyof typeof STATS_TEXT;
export const st = (key: StatsTextKey, language: string): string => {
  const row = STATS_TEXT[key] as Row;
  return row[language as NavLanguage] ?? row.en;
};
export const typeLabel = (type: string, language: string): string => (type in STATS_TEXT ? st(type as StatsTextKey, language) : st('other', language));

// Country name in the reader's language (the browser knows them all); the code itself when it cannot.
export function regionName(code: string, language: string): string {
  try {
    return new Intl.DisplayNames([(SEO_LANGS as readonly string[]).includes(language) ? language : 'en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

// 1.2K, 3.4M ... in the reader's language, for chart axes and big numbers.
export function compact(n: number, locale: string): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
