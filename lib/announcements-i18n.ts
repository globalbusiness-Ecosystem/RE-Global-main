import type { NavLanguage } from './nav-i18n';
import type { AnnouncementKind } from './announcements';

type L7 = Record<NavLanguage, string>;

export const ANN_KIND: Record<AnnouncementKind, L7> = {
  offer: { en: 'Offer', ar: 'عرض', fr: 'Offre', es: 'Oferta', pt: 'Oferta', ur: 'آفر', zh: '优惠' },
  partnership: { en: 'Partnership', ar: 'شراكة', fr: 'Partenariat', es: 'Alianza', pt: 'Parceria', ur: 'شراکت', zh: '合作' },
  event: { en: 'Event', ar: 'فعالية', fr: 'Événement', es: 'Evento', pt: 'Evento', ur: 'تقریب', zh: '活动' },
  news: { en: 'News', ar: 'خبر', fr: 'Actualité', es: 'Noticia', pt: 'Novidade', ur: 'خبر', zh: '新闻' },
  video: { en: 'Video', ar: 'فيديو', fr: 'Vidéo', es: 'Vídeo', pt: 'Vídeo', ur: 'ویڈیو', zh: '视频' },
};
export const ANN_EMOJI: Record<AnnouncementKind, string> = { offer: '🎁', partnership: '🤝', event: '📅', news: '📰', video: '🎬' };

export const ANN_UI = {
  title: { en: 'Offers & events', ar: 'العروض والفعاليات', fr: 'Offres et événements', es: 'Ofertas y eventos', pt: 'Ofertas e eventos', ur: 'آفرز اور تقریبات', zh: '优惠与活动' },
  watch: { en: 'Watch', ar: 'شاهد', fr: 'Regarder', es: 'Ver', pt: 'Assistir', ur: 'دیکھیں', zh: '观看' },
  learnMore: { en: 'Learn more', ar: 'اعرف أكثر', fr: 'En savoir plus', es: 'Saber más', pt: 'Saiba mais', ur: 'مزید جانیں', zh: '了解更多' },
  endsOn: { en: 'Ends', ar: 'ينتهي', fr: 'Jusqu’au', es: 'Hasta', pt: 'Até', ur: 'آخری تاریخ', zh: '截止' },
  onDate: { en: 'On', ar: 'يوم', fr: 'Le', es: 'El', pt: 'Em', ur: 'تاریخ', zh: '日期' },
  close: { en: 'Close', ar: 'إغلاق', fr: 'Fermer', es: 'Cerrar', pt: 'Fechar', ur: 'بند کریں', zh: '关闭' },
} satisfies Record<string, L7>;

export const annText = (d: L7, language: string): string => d[language as NavLanguage] || d.en;
