// Admin language (Arabic / English). Pure: no React. Phase 298 covers the shell, the menus, the jump box and the section names.
// The panels inside each section are still Arabic; they move over one section at a time.

import { NAV } from '@/lib/admin-nav';

export type AdminLang = 'ar' | 'en';
export const LANG_KEY = 'admin_lang';

/** Anything that is not exactly "en" is Arabic, the default. */
export const parseLang = (v: unknown): AdminLang => (v === 'en' ? 'en' : 'ar');
export const otherLang = (l: AdminLang): AdminLang => (l === 'en' ? 'ar' : 'en');
export const dirOf = (l: AdminLang): 'rtl' | 'ltr' => (l === 'en' ? 'ltr' : 'rtl');

export const SHELL = {
  tab_dashboard: { ar: 'الرئيسية', en: 'Home' },
  tab_properties: { ar: 'العقارات', en: 'Properties' },
  tab_payments: { ar: 'المدفوعات', en: 'Payments' },
  tab_users: { ar: 'المستخدمون', en: 'Users' },
  tab_content: { ar: 'المحتوى', en: 'Content' },
  tab_admins: { ar: 'الأدمن', en: 'Admins' },
  title: { ar: 'RE Global — الأدمن', en: 'RE Global — Admin' },
  security: { ar: 'الأمان', en: 'Security' },
  openSite: { ar: 'فتح الموقع', en: 'Open the site' },
  logout: { ar: 'تسجيل خروج', en: 'Sign out' },
  logoutShort: { ar: 'خروج', en: 'Sign out' },
  quick: { ar: 'انتقل بسرعة', en: 'Jump to' },
  quickSearch: { ar: 'اكتب اسم القسم… (مثلًا: هوية، payouts، سعر)', en: 'Type a section name… (e.g. identity, payouts, rate)' },
  quickAria: { ar: 'ابحث عن قسم في الأدمن', en: 'Search for an admin section' },
  quickNone: { ar: 'مفيش قسم بالاسم ده', en: 'No section with that name' },
  sidebarAria: { ar: 'القائمة الجانبية', en: 'Side menu' },
  sectionsAria: { ar: 'الأقسام', en: 'Sections' },
  bottomAria: { ar: 'التنقل السفلي', en: 'Bottom navigation' },
  langSwitch: { ar: 'English', en: 'العربية' },
  langSwitchShort: { ar: 'EN', en: 'ع' },
  langAria: { ar: 'تغيير اللغة إلى الإنجليزية', en: 'Switch language to Arabic' },
} as const;
export type ShellKey = keyof typeof SHELL;

export const tr = (key: ShellKey, lang: AdminLang): string => SHELL[key][lang];
export const tabLabel = (id: string, lang: AdminLang, fallback = ''): string => {
  const k = `tab_${id}` as ShellKey;
  return k in SHELL ? SHELL[k][lang] : fallback;
};

/** The section name for a sub-tab: English from the jump list, or the given Arabic label. */
export function subLabel(storeKey: string, id: string, lang: AdminLang, arabic: string): string {
  if (lang === 'ar') return arabic;
  return NAV.find((n) => n.storeKey === storeKey && n.sub === id)?.en ?? arabic;
}

/** Names for one entry of the jump box: the main one in the chosen language, the other one smaller beside it. */
export function navNames(e: { label: string; en: string }, lang: AdminLang): { main: string; other: string; otherDir: 'rtl' | 'ltr' } {
  return lang === 'en' ? { main: e.en, other: e.label, otherDir: 'rtl' } : { main: e.label, other: e.en, otherDir: 'ltr' };
}
