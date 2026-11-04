import type { NavLanguage } from './nav-i18n';

// Texts that only the Buy page uses (the ones it shares with the Rent page live in rent-page-labels.ts), in all 7 languages.
// {pi} is the amount in π.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const BUY_PAGE_LABELS = {
  pageTitle: { en: 'Buy Properties', ar: 'شراء العقارات', fr: 'Acheter des biens', es: 'Comprar propiedades', pt: 'Comprar imóveis', ur: 'جائیدادیں خریدیں', zh: '购买房产' },
  pageSubtitle: { en: 'Discover premium properties worldwide', ar: 'اكتشف العقارات الفاخرة في جميع أنحاء العالم', fr: 'Découvrez des biens haut de gamme dans le monde entier', es: 'Descubre propiedades premium en todo el mundo', pt: 'Descubra imóveis premium em todo o mundo', ur: 'دنیا بھر کی اعلیٰ جائیدادیں دریافت کریں', zh: '发现全球优质房产' },
  price: { en: 'Price', ar: 'السعر', fr: 'Prix', es: 'Precio', pt: 'Preço', ur: 'قیمت', zh: '价格' },
  youPay: { en: 'You pay ≈ {pi} π', ar: 'هتدفع ≈ {pi} π', fr: 'Vous payez ≈ {pi} π', es: 'Pagas ≈ {pi} π', pt: 'Você paga ≈ {pi} π', ur: 'آپ ادا کریں گے ≈ {pi} π', zh: '您需支付 ≈ {pi} π' },
  piUnavailable: { en: 'Payment in π is not available yet', ar: 'الدفع بالـ π مش متاح لسه', fr: 'Le paiement en π n’est pas encore disponible', es: 'El pago en π aún no está disponible', pt: 'O pagamento em π ainda não está disponível', ur: 'π میں ادائیگی ابھی دستیاب نہیں', zh: '暂不支持使用 π 支付' },
  baths: { en: 'Baths', ar: 'حمام', fr: 'SdB', es: 'Baños', pt: 'Banheiros', ur: 'باتھ روم', zh: '浴室' },
  mapNA: { en: 'Map location not available', ar: 'الموقع على الخريطة غير متاح', fr: 'Emplacement sur la carte indisponible', es: 'Ubicación en el mapa no disponible', pt: 'Localização no mapa indisponível', ur: 'نقشے پر مقام دستیاب نہیں', zh: '暂无地图位置' },
  tour360: { en: '360° Virtual Tour', ar: 'جولة افتراضية 360°', fr: 'Visite virtuelle 360°', es: 'Visita virtual 360°', pt: 'Tour virtual 360°', ur: '360° ورچوئل ٹور', zh: '360° 虚拟看房' },
  tour360NA: { en: '360° tour not available', ar: 'الجولة الافتراضية غير متاحة', fr: 'Visite 360° indisponible', es: 'Visita 360° no disponible', pt: 'Tour 360° indisponível', ur: '360° ٹور دستیاب نہیں', zh: '暂无 360° 看房' },
  sold: { en: 'This property has been sold', ar: 'العقار ده اتباع', fr: 'Ce bien a été vendu', es: 'Esta propiedad ya se vendió', pt: 'Este imóvel já foi vendido', ur: 'یہ جائیداد فروخت ہو چکی ہے', zh: '该房产已售出' },
} satisfies Record<string, Row>;

export type BuyPageLabelKey = keyof typeof BUY_PAGE_LABELS;

export function bp(key: BuyPageLabelKey, language: string | undefined, vars: Record<string, string | number> = {}): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  let text = (BUY_PAGE_LABELS[key] as Row)[known];
  for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  return text;
}
