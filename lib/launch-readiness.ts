// "Can we open the site to the public?" Pure: takes yes/no flags and counts (never secret values) and lists checks.

export type ReadinessInput = {
  env: {
    PI_API_KEY: boolean; PI_ISSUER_SECRET_KEY: boolean; PI_ISSUER_PUBLIC_KEY: boolean;
    ADMIN_SESSION_SECRET: boolean; ADMIN_TOTP_SECRET: boolean; ADMIN_PIN_STRONG: boolean; ADMIN_ALERT_EMAIL: boolean; CRON_SECRET: boolean;
    EMAIL_CONFIGURED: boolean; FIREBASE_WEB_CONFIG: boolean; CUSTOM_DOMAIN: boolean; REGISTRY_CONTRACT_ID: boolean;
  };
  cardSandboxOn: boolean;
  /** A real card company is connected (not the test provider). */
  realCardProvider: boolean;
  /** Identity checks are done by a company (true) or by hand (false). */
  kycByCompany: boolean;
  visibleProperties: number;
  incompleteListings: number;
  usdProperties: number;
  piRateSet: boolean;
  reviewCases: number;
  shareMismatches: number;
  kycPending: number;
  kycOldestHours: number;
};

export type ReadinessGroup = 'security' | 'pi' | 'cards' | 'identity' | 'content' | 'site';
export type ReadinessCheck = {
  id: string;
  group: ReadinessGroup;
  ok: boolean;
  /** A failed blocking check means do not open the site yet; a failed non-blocking one is a recommendation. */
  blocking: boolean;
  title: string;
  /** What to do when it is not ok. */
  fix: string;
};

export const GROUP_LABELS: Record<ReadinessGroup, string> = {
  security: 'الأمان', pi: 'الدفع بـ Pi والعقود', cards: 'الدفع بالبطاقة', identity: 'التحقق من الهوية', content: 'المحتوى', site: 'الموقع',
};

export function buildReadiness(i: ReadinessInput): ReadinessCheck[] {
  const c = (id: string, group: ReadinessGroup, ok: boolean, blocking: boolean, title: string, fix: string): ReadinessCheck => ({ id, group, ok, blocking, title, fix });
  const e = i.env;
  return [
    c('admin-secret', 'security', e.ADMIN_SESSION_SECRET, true, 'سر جلسة الأدمن متضبط', 'ضيف ADMIN_SESSION_SECRET (نص عشوائي طويل) في Vercel.'),
    c('admin-2fa', 'security', e.ADMIN_TOTP_SECRET, true, 'التحقق بخطوتين للأدمن شغال', 'فعّل ADMIN_TOTP_SECRET حسب دليل التشغيل.'),
    c('admin-pin', 'security', e.ADMIN_PIN_STRONG, true, 'الـ PIN بتاع الأدمن قوي', 'غيّر ADMIN_PIN لـ 10 حروف/أرقام أو أكتر.'),
    c('admin-alert', 'security', e.ADMIN_ALERT_EMAIL, false, 'إيميل تنبيهات الأدمن متضبط', 'ضيف ADMIN_ALERT_EMAIL عشان توصلك رسالة عند أي دخول جديد.'),
    c('cron', 'security', e.CRON_SECRET, false, 'الملخص اليومي والتذكيرات شغالين', 'ضيف CRON_SECRET في Vercel.'),
    c('pi-key', 'pi', e.PI_API_KEY, true, 'مفتاح Pi API متضبط', 'ضيف PI_API_KEY في Vercel.'),
    c('pi-signing', 'pi', e.PI_ISSUER_SECRET_KEY && e.PI_ISSUER_PUBLIC_KEY, true, 'مفاتيح توقيع العقود متضبطة', 'ضيف PI_ISSUER_SECRET_KEY و PI_ISSUER_PUBLIC_KEY في Vercel.'),
    c('pi-rate', 'pi', i.usdProperties === 0 || i.piRateSet, true, 'سعر Pi متحدد للعقارات المسعّرة بالدولار', 'حدده من المحتوى ← 💱.'),
    c('sandbox-off', 'cards', !i.cardSandboxOn, true, 'محاكي الدفع بالبطاقة مقفول', 'شيل CARD_SANDBOX_SECRET من Vercel وأعد النشر: المحاكي بيخلّي أي مستخدم يعلّم عقار "مباع" من غير دفع.'),
    c('real-card', 'cards', i.realCardProvider, false, 'شركة دفع حقيقية متوصلة (لو هتفتح الدفع بالبطاقة)', 'محتاج حساب تاجر وadapter للشركة. من غيره الدفع بالبطاقة مش هيشتغل للناس: اقفل الزرار أو أجّل الإطلاق للبطاقة.'),
    c('registry', 'cards', e.REGISTRY_CONTRACT_ID, false, 'سجل الملكية (العقد الذكي) متوصل لعقود البطاقة', 'انشر العقد من contracts/ownership-registry وضيف REGISTRY_CONTRACT_ID في Vercel (الخطوات في docs/OPERATIONS.md).'),
    c('email', 'cards', e.EMAIL_CONFIGURED, false, 'الإيميل شغال (Gmail أو Resend)', 'ضيف GMAIL_USER و GMAIL_APP_PASSWORD أو RESEND_API_KEY: من غيره مفيش إيصالات ولا إيميلات قرار التحقق.'),
    c('kyc-mode', 'identity', true, false, i.kycByCompany ? 'التحقق بيتم عند شركة متخصصة' : 'التحقق بيتم يدويًا من لوحة الأدمن', 'لو متوقع طلبات كتير، اربط شركة تحقق (Sumsub / Veriff).'),
    c('kyc-queue', 'identity', i.kycPending === 0 || i.kycOldestHours < 48, true, 'مفيش طلبات تحقق متأخرة أكتر من 48 ساعة', 'راجع الطلبات من المدفوعات ← التحقق من الهوية.'),
    c('listings', 'content', i.visibleProperties > 0, true, 'فيه عقار ظاهر للزوار على الأقل', 'ضيف عقار أو اظهر واحد من لوحة العقارات.'),
    c('complete', 'content', i.incompleteListings === 0, false, 'كل العقارات الظاهرة مكتملة (صورة وسعر وخريطة)', 'افتح العقارات ← ناقصة البيانات.'),
    c('review', 'content', i.reviewCases === 0, true, 'مفيش حجوزات أو حصص محتاجة مراجعة', 'افتح المدفوعات والغي الحالات اللي محتاجة استرداد.'),
    c('shares', 'content', i.shareMismatches === 0, false, 'عدّادات الحصص مطابقة للمشتريات', 'راجع العقارات اللي ظاهرة في "محتاج انتباهك".'),
    c('firebase-web', 'site', e.FIREBASE_WEB_CONFIG, true, 'إعدادات Firebase للويب كاملة (تسجيل الدخول بجوجل والإيميل)', 'ضيف متغيرات NEXT_PUBLIC_FIREBASE_* في Vercel.'),
    c('domain', 'site', e.CUSTOM_DOMAIN, false, 'دومين خاص متضبط (NEXT_PUBLIC_BASE_URL)', 'لو عندك دومين، ضيفه في Vercel وفي NEXT_PUBLIC_BASE_URL.'),
  ];
}

export function readinessSummary(checks: ReadinessCheck[]): { ready: boolean; blocking: number; advice: number; total: number; passed: number } {
  const failed = checks.filter((x) => !x.ok);
  const blocking = failed.filter((x) => x.blocking).length;
  return { ready: blocking === 0, blocking, advice: failed.length - blocking, total: checks.length, passed: checks.length - failed.length };
}
