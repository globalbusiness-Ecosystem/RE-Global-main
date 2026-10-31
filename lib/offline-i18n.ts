import type { NavLanguage } from './nav-i18n';

// The "you are offline" strip. It must not promise cached data: the app only keeps a saved copy of the guest's bookings.
export interface OfflineStrings { message: string; close: string }

export const OFFLINE_I18N: Record<NavLanguage, OfflineStrings> = {
  en: { message: 'You are offline. Some features need an internet connection.', close: 'Close' },
  ar: { message: 'مفيش اتصال بالإنترنت. بعض الخدمات محتاجة نت عشان تشتغل.', close: 'إغلاق' },
  fr: { message: 'Vous êtes hors ligne. Certaines fonctions nécessitent une connexion Internet.', close: 'Fermer' },
  es: { message: 'Sin conexión. Algunas funciones necesitan internet.', close: 'Cerrar' },
  pt: { message: 'Você está offline. Alguns recursos precisam de internet.', close: 'Fechar' },
  ur: { message: 'آپ آف لائن ہیں۔ کچھ سہولیات کے لیے انٹرنیٹ درکار ہے۔', close: 'بند کریں' },
  zh: { message: '您已离线。部分功能需要网络连接。', close: '关闭' },
};
