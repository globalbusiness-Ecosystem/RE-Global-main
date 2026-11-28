// The admin's "jump to" list: every section and sub-section in one place, plus a small search over it. Pure (no React).
// A test checks that every entry still exists in the real tabs, so this list cannot drift from the screens.

export const NAV_EVENT = 'admin-goto-sub';
/** localStorage key prefix the sub-tab bar uses to remember the open tab (+ storeKey). */
export const SUB_STORE_PREFIX = 'admin-sub-';

export type NavEntry = { tab: string; storeKey?: string; sub?: string; icon: string; label: string; en: string; words?: string };

const e = (tab: string, storeKey: string | undefined, sub: string | undefined, icon: string, label: string, en: string, words = ''): NavEntry => ({ tab, storeKey, sub, icon, label, en, words });

export const NAV: NavEntry[] = [
  e('dashboard', undefined, undefined, '📊', 'الرئيسية', 'Home', 'dashboard لوحة احصائيات جاهزية الاطلاق readiness'),
  e('dashboard', 'dashboard', 'activity', '📜', 'سجل النشاط', 'Activity log', 'audit تدقيق'),
  e('dashboard', 'dashboard', 'reports', '🚩', 'البلاغات', 'Reports', 'listing reports بلاغ'),
  e('dashboard', 'dashboard', 'security', '🛡️', 'الأمان والأخطاء', 'Security and errors', 'csp errors اخطاء بصمه passkey جلسات sessions'),
  e('dashboard', 'dashboard', 'backup', '💾', 'النسخ الاحتياطي', 'Backup', 'نسخه export'),
  e('properties', undefined, undefined, '🏠', 'العقارات', 'Properties', 'عقار'),
  e('properties', 'properties', 'list', '🏠', 'قائمة العقارات', 'Property list', 'اضافه تعديل owner مالك شريعه shariah'),
  e('properties', 'properties', 'display', '⚙️', 'إعدادات العرض', 'Display settings', 'demo تجريبي tours جولات'),
  e('properties', 'properties', 'announcements', '📣', 'الإعلانات والفيديو', 'Announcements and video', 'اعلان'),
  e('properties', 'properties', 'homefeatures', '✨', 'شريط الرئيسية', 'Home strip', 'home features مميزات'),
  e('properties', 'properties', 'branding', '🎨', 'اللوجو', 'Logo and branding', 'branding هويه شعار icon ايقونه'),
  e('payments', undefined, undefined, '💳', 'المدفوعات', 'Payments', 'فلوس'),
  e('payments', 'payments', 'payments', '💳', 'قائمة المدفوعات', 'Payments list', 'عقود contracts رابط المالك'),
  e('payments', 'payments', 'card-orders', '🧾', 'طلبات البطاقة', 'Card orders', 'visa كارت تسليم'),
  e('payments', 'payments', 'kyc', '🪪', 'التحقق من الهوية', 'Identity verification', 'kyc بطاقه هويه موافقه رفض'),
  e('payments', 'payments', 'compliance', '🛡️', 'سجل الامتثال', 'Compliance register', 'aml امتثال'),
  e('payments', 'payments', 'partners', '🤝', 'الشركاء', 'Partners', 'عمولات commissions احاله referral'),
  e('payments', 'payments', 'payouts', '💸', 'التحويلات والاستردادات', 'Payouts and refunds', 'استرداد refund مستحقات'),
  e('payments', 'payments', 'distributions', '📊', 'توزيع العوائد', 'Income distributions', 'عوائد ايجار دخل توزيع'),
  e('payments', 'payments', 'bookings', '🛏️', 'الحجوزات', 'Bookings', 'فندق حجز'),
  e('payments', 'payments', 'policies', '⭐', 'التقييمات والسياسات', 'Reviews and policies', 'تقييم الغاء cancellation'),
  e('payments', 'payments', 'shares', '🧩', 'سوق الحصص', 'Share market', 'حصص holdings رسوم fees'),
  e('users', undefined, undefined, '👥', 'المستخدمون', 'Users', 'حظر ban مستخدم'),
  e('content', undefined, undefined, '🧩', 'المحتوى', 'Content', 'محتوي'),
  e('content', 'content', 'banners', '🖼️', 'بانرات الصفحة الرئيسية', 'Home banners', 'banner'),
  e('content', 'content', 'partners', '🤝', 'الشركاء (الظاهرين للزوار)', 'Partners page', 'partner'),
  e('content', 'content', 'texts', '✍️', 'نصوص الصفحات', 'Page texts', 'ترجمه translations'),
  e('content', 'content', 'pricing', '💱', 'سعر Pi', 'Pi rate', 'سعر الدولار usd pricing'),
  e('content', 'content', 'legal', '⚖️', 'القانون وبنود العقد', 'Legal and contract terms', 'contract بنود عقد framework خصوصيه'),
  e('content', 'content', 'rewards', '🎁', 'المكافآت', 'Rewards', 'نقاط points badges شارات'),
  e('content', 'content', 'about', 'ℹ️', 'نبذة عنا', 'About us', 'founder مؤسس'),
  e('admins', undefined, undefined, '🛡️', 'الأدمن', 'Admins', 'موظفين staff صلاحيات roles'),
];

const AR_MARKS = /[\u064B-\u065F\u0670\u0640]/g;
/** Lower-case, no Arabic marks or tatweel, one spelling per Arabic letter family, single spaces. */
export function norm(s: string): string {
  return String(s ?? '').toLowerCase().replace(AR_MARKS, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/** Entries whose label, English name or keywords contain every word typed. An empty query returns everything. Keeps the list order. */
export function searchNav(query: string, entries: NavEntry[] = NAV): NavEntry[] {
  const words = norm(query).split(' ').filter(Boolean);
  if (!words.length) return entries;
  return entries.filter((x) => {
    const hay = norm(`${x.label} ${x.en} ${x.words ?? ''}`);
    return words.every((w) => hay.includes(w));
  });
}
