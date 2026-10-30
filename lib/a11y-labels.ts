import type { NavLanguage } from './nav-i18n';

// Names for icon-only buttons (close, back, favourite, share...). A screen reader reads an icon button as just
// "button" unless it has a name. Pure: safe for the browser and the server.
export interface A11yLabels { close: string; back: string; addFavorite: string; removeFavorite: string; share: string; refresh: string; stopSpeaking: string; send: string }

export const A11Y_LABELS: Record<NavLanguage, A11yLabels> = {
  en: { close: 'Close', back: 'Back', addFavorite: 'Add to favorites', removeFavorite: 'Remove from favorites', share: 'Share', refresh: 'Refresh', stopSpeaking: 'Stop speaking', send: 'Send' },
  ar: { close: 'إغلاق', back: 'رجوع', addFavorite: 'أضف للمفضلة', removeFavorite: 'احذف من المفضلة', share: 'مشاركة', refresh: 'تحديث', stopSpeaking: 'إيقاف الصوت', send: 'إرسال' },
  fr: { close: 'Fermer', back: 'Retour', addFavorite: 'Ajouter aux favoris', removeFavorite: 'Retirer des favoris', share: 'Partager', refresh: 'Actualiser', stopSpeaking: 'Arrêter la voix', send: 'Envoyer' },
  es: { close: 'Cerrar', back: 'Atrás', addFavorite: 'Añadir a favoritos', removeFavorite: 'Quitar de favoritos', share: 'Compartir', refresh: 'Actualizar', stopSpeaking: 'Detener la voz', send: 'Enviar' },
  pt: { close: 'Fechar', back: 'Voltar', addFavorite: 'Adicionar aos favoritos', removeFavorite: 'Remover dos favoritos', share: 'Compartilhar', refresh: 'Atualizar', stopSpeaking: 'Parar a voz', send: 'Enviar' },
  ur: { close: 'بند کریں', back: 'واپس', addFavorite: 'پسندیدہ میں شامل کریں', removeFavorite: 'پسندیدہ سے ہٹائیں', share: 'شیئر کریں', refresh: 'ریفریش کریں', stopSpeaking: 'آواز بند کریں', send: 'بھیجیں' },
  zh: { close: '关闭', back: '返回', addFavorite: '加入收藏', removeFavorite: '取消收藏', share: '分享', refresh: '刷新', stopSpeaking: '停止朗读', send: '发送' },
};
export const a11yLabels = (lang: string): A11yLabels => A11Y_LABELS[lang as NavLanguage] ?? A11Y_LABELS.en;
