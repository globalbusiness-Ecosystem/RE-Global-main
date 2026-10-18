import type { NavLanguage } from './nav-i18n';

export interface CardStrings { price: string; sold: string; viewMap: string; noMap: string; tour: string; noTour: string; tourTitle: string; here: string; details: string; close: string; favorite: string; featured: string }

export const CARD_I18N: Record<NavLanguage, CardStrings> = {
  en: { price: 'Price', sold: 'Sold', viewMap: 'View on map', noMap: 'No map location for this property', tour: '360° tour', noTour: 'No 360° tour for this property', tourTitle: '360° Virtual Tour', here: 'Property location', details: 'Details', close: 'Close', favorite: 'Add to favorites', featured: 'Featured' },
  ar: { price: 'السعر', sold: 'مباع', viewMap: 'اعرض على الخريطة', noMap: 'مفيش موقع على الخريطة للعقار ده', tour: 'جولة 360°', noTour: 'مفيش جولة 360° للعقار ده', tourTitle: 'جولة افتراضية 360°', here: 'موقع العقار', details: 'تفاصيل', close: 'إغلاق', favorite: 'ضيف للمفضلة', featured: 'مميز' },
  fr: { price: 'Prix', sold: 'Vendu', viewMap: 'Voir sur la carte', noMap: "Pas d'emplacement sur la carte", tour: 'Visite 360°', noTour: 'Pas de visite 360°', tourTitle: 'Visite virtuelle 360°', here: 'Emplacement du bien', details: 'Détails', close: 'Fermer', favorite: 'Ajouter aux favoris', featured: 'Mis en avant' },
  es: { price: 'Precio', sold: 'Vendido', viewMap: 'Ver en el mapa', noMap: 'Sin ubicación en el mapa', tour: 'Tour 360°', noTour: 'Sin tour 360°', tourTitle: 'Tour virtual 360°', here: 'Ubicación de la propiedad', details: 'Detalles', close: 'Cerrar', favorite: 'Añadir a favoritos', featured: 'Destacado' },
  pt: { price: 'Preço', sold: 'Vendido', viewMap: 'Ver no mapa', noMap: 'Sem localização no mapa', tour: 'Tour 360°', noTour: 'Sem tour 360°', tourTitle: 'Tour virtual 360°', here: 'Localização do imóvel', details: 'Detalhes', close: 'Fechar', favorite: 'Adicionar aos favoritos', featured: 'Destaque' },
  ur: { price: 'قیمت', sold: 'فروخت', viewMap: 'نقشے پر دیکھیں', noMap: 'نقشے پر مقام نہیں', tour: '360° ٹور', noTour: '360° ٹور دستیاب نہیں', tourTitle: '360° ورچوئل ٹور', here: 'پراپرٹی کا مقام', details: 'تفصیل', close: 'بند کریں', favorite: 'پسندیدہ میں شامل کریں', featured: 'نمایاں' },
  zh: { price: '价格', sold: '已售', viewMap: '在地图上查看', noMap: '该房源没有地图位置', tour: '360° 导览', noTour: '该房源没有 360° 导览', tourTitle: '360° 虚拟导览', here: '房源位置', details: '详情', close: '关闭', favorite: '加入收藏', featured: '精选' },
};
