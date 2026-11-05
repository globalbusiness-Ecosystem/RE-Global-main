import type { NavLanguage } from './nav-i18n';

// Texts of the Off-Plan page, the Favorites page, the property card and the featured-listings block, on top of the shared ones
// (rent-page-labels.ts, listing-pages-labels.ts), in all 7 languages.
type Row = Record<NavLanguage, string>;
const LANGS: NavLanguage[] = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'];

export const MORE_PAGE_LABELS = {
  offplanTitle: { en: 'Off-Plan Properties', ar: 'العقارات قيد الإنشاء', fr: 'Biens sur plan', es: 'Propiedades sobre plano', pt: 'Imóveis na planta', ur: 'زیر تعمیر جائیدادیں', zh: '期房' },
  startingPrice: { en: 'Starting Price', ar: 'السعر الابتدائي', fr: 'Prix de départ', es: 'Precio inicial', pt: 'Preço inicial', ur: 'ابتدائی قیمت', zh: '起售价' },
  favoritesTitle: { en: 'Favorites', ar: 'المفضلات', fr: 'Favoris', es: 'Favoritos', pt: 'Favoritos', ur: 'پسندیدہ', zh: '收藏' },
  noImage: { en: 'No image', ar: 'لا توجد صورة', fr: 'Aucune image', es: 'Sin imagen', pt: 'Sem imagem', ur: 'تصویر دستیاب نہیں', zh: '暂无图片' },
  aiPrice: { en: 'AI Price', ar: 'سعر ذكي', fr: 'Prix IA', es: 'Precio IA', pt: 'Preço IA', ur: 'AI قیمت', zh: 'AI 估价' },
  viewQrCode: { en: 'View QR Code', ar: 'عرض رمز QR', fr: 'Voir le code QR', es: 'Ver código QR', pt: 'Ver código QR', ur: 'QR کوڈ دیکھیں', zh: '查看二维码' },
  viewQr: { en: 'View QR', ar: 'عرض QR', fr: 'Voir QR', es: 'Ver QR', pt: 'Ver QR', ur: 'QR دیکھیں', zh: '查看二维码' },
  featuredProperties: { en: '⭐ Featured Properties', ar: '⭐ عقارات مميزة', fr: '⭐ Biens à la une', es: '⭐ Propiedades destacadas', pt: '⭐ Imóveis em destaque', ur: '⭐ نمایاں جائیدادیں', zh: '⭐ 精选房产' },
} satisfies Record<string, Row>;

export type MorePageLabelKey = keyof typeof MORE_PAGE_LABELS;

export function mpl(key: MorePageLabelKey, language: string | undefined): string {
  const known = LANGS.find((l) => l === language) ?? 'en';
  return (MORE_PAGE_LABELS[key] as Row)[known];
}
