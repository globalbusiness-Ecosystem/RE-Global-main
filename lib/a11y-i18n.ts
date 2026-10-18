import type { NavLanguage } from './nav-i18n';

export interface A11yStrings { skip: string; close: string }

export const A11Y_I18N: Record<NavLanguage, A11yStrings> = {
  en: { skip: 'Skip to main content', close: 'Close' },
  ar: { skip: 'تخطَّ إلى المحتوى الرئيسي', close: 'إغلاق' },
  fr: { skip: 'Aller au contenu principal', close: 'Fermer' },
  es: { skip: 'Saltar al contenido principal', close: 'Cerrar' },
  pt: { skip: 'Ir para o conteúdo principal', close: 'Fechar' },
  ur: { skip: 'مرکزی مواد پر جائیں', close: 'بند کریں' },
  zh: { skip: '跳到主要内容', close: '关闭' },
};
