import type { NavLanguage } from './nav-i18n';

export interface ShareStrings { share: string; copied: string; copyFailed: string; openPage: string }

export const SHARE_I18N: Record<NavLanguage, ShareStrings> = {
  en: { share: 'Share', copied: 'Link copied', copyFailed: 'Could not copy the link', openPage: 'Public property page' },
  ar: { share: 'شارك', copied: 'اتنسخ الرابط', copyFailed: 'معرفناش ننسخ الرابط', openPage: 'صفحة العقار العامة' },
  fr: { share: 'Partager', copied: 'Lien copié', copyFailed: 'Impossible de copier le lien', openPage: 'Page publique du bien' },
  es: { share: 'Compartir', copied: 'Enlace copiado', copyFailed: 'No se pudo copiar el enlace', openPage: 'Página pública de la propiedad' },
  pt: { share: 'Compartilhar', copied: 'Link copiado', copyFailed: 'Não foi possível copiar o link', openPage: 'Página pública do imóvel' },
  ur: { share: 'شیئر کریں', copied: 'لنک کاپی ہو گیا', copyFailed: 'لنک کاپی نہیں ہو سکا', openPage: 'جائیداد کا عوامی صفحہ' },
  zh: { share: '分享', copied: '链接已复制', copyFailed: '无法复制链接', openPage: '房源公开页面' },
};
