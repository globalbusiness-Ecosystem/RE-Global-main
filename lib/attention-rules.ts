// What the admin should look at right now. Pure: takes plain counts and yes/no flags (never secret values).

const CHAIN_ACCOUNT_TEXT = {
  low_balance: 'رصيد حساب المنصة على Pi Testnet قليل: لو خلص، عقود البطاقة مش هتتثبّت على البلوك تشين. شحنه بـ Test-π (المدفوعات ← طلبات البطاقة ← 🔍 افحص حساب المنصة بيعرض عنوانه).',
  not_found: 'حساب تثبيت العقود مش موجود على Pi Testnet (لازم يتفعّل ويتشحن): المدفوعات ← طلبات البطاقة ← 🔍 افحص حساب المنصة.',
  mismatch: 'المفتاح العام في Vercel (PI_ISSUER_PUBLIC_KEY) مش بتاع المفتاح السري: شيله أو صحّحه.',
  bad_secret: 'مفتاح تثبيت العقود السري (CHAIN_ANCHOR_SECRET_KEY أو PI_ISSUER_SECRET_KEY) شكله مش سليم.',
} as const;

export type AttentionInput = {
  env: { PI_API_KEY: boolean; PI_ISSUER_SECRET_KEY: boolean; PI_ISSUER_PUBLIC_KEY: boolean; ADMIN_SESSION_SECRET: boolean; ADMIN_TOTP_SECRET?: boolean; ADMIN_PIN_STRONG?: boolean; ADMIN_ALERT_EMAIL?: boolean; CRON_SECRET?: boolean };
  usdProperties: number;
  piRateSet: boolean;
  pendingPayouts: { count: number; amount: number };
  review: { bookings: number; holdings: number; transfers: number };
  /** Titles of properties whose sold-shares counter does not match the confirmed purchases. */
  shareMismatches?: string[];
  /** Reports about listings that nobody has looked at yet. */
  openReports?: number;
  /** Visible listings with no photo, no price or no map spot. */
  incompleteListings?: number;
  /** Card payments: sales paid and waiting to be handed over, refunds owed in a card currency, identity requests waiting. */
  cardOrdersToHandOver?: number;
  cardRefunds?: number;
  /** Card contracts that are signed but whose fingerprint is not on the blockchain yet. */
  cardContractsUnanchored?: number;
  /** What the check of the platform's blockchain account found (only the problems; 'ok', 'network' and 'no_keys' are not passed). */
  chainAccount?: 'low_balance' | 'not_found' | 'mismatch' | 'bad_secret';
  /** Paid card orders of web buyers that have no signed contract (the buyer sees nothing in Contracts). */
  cardOrdersWithoutContract?: number;
  kycPending?: number;
  /** Hours the oldest identity request has been waiting (people are blocked from paying until it is decided). */
  kycOldestHours?: number;
  /** The test payment provider is switched on (CARD_SANDBOX_SECRET is set). */
  cardSandboxOn?: boolean;
};

export type AttentionItem = { id: string; level: 'bad' | 'warn'; text: string; tab: 'dashboard' | 'properties' | 'payments' | 'users' | 'content' };

/** A person waiting this long to be verified counts as late. */
export const KYC_LATE_HOURS = 48;

const round2 = (n: number) => Math.round(n * 100) / 100;

// Items that stop money or contracts come first ("bad"), then things waiting on a person ("warn").
export function buildAttention(i: AttentionInput): AttentionItem[] {
  const out: AttentionItem[] = [];
  if (i.cardSandboxOn) out.push({ id: 'card-sandbox', level: 'bad', text: 'محاكي الدفع بالبطاقة شغال (CARD_SANDBOX_SECRET): أي مستخدم مسجّل يقدر يعلّم عقار "مباع" أو حجز "مؤكد" من غير ما يدفع. شيله من Vercel وأعد النشر قبل ما تفتح الموقع للناس.', tab: 'dashboard' });
  if (!i.env.PI_API_KEY) out.push({ id: 'env-pi-key', level: 'bad', text: 'مفتاح Pi API مش متضبط في Vercel: الدفع واقف.', tab: 'dashboard' });
  if (!i.env.PI_ISSUER_SECRET_KEY || !i.env.PI_ISSUER_PUBLIC_KEY) out.push({ id: 'env-signing', level: 'bad', text: 'مفاتيح توقيع العقود ناقصة في Vercel: العمليات مش هتتسجل ولا هيتعملها عقد.', tab: 'dashboard' });
  if (!i.env.ADMIN_SESSION_SECRET) out.push({ id: 'env-admin-secret', level: 'bad', text: 'ADMIN_SESSION_SECRET مش متضبط: جلسة الأدمن مش آمنة.', tab: 'dashboard' });
  if (i.usdProperties > 0 && !i.piRateSet) out.push({ id: 'rate', level: 'bad', text: `في ${i.usdProperties} عقار مسعّر بالدولار وسعر Pi مش متحدد: محدش يقدر يشتريهم. حدده من المحتوى ← 💱.`, tab: 'content' });
  const r = i.review;
  if (r.bookings > 0) out.push({ id: 'review-bookings', level: 'bad', text: `${r.bookings} حجز محتاج مراجعة (الضيف دفع والأيام اتاخدت): الغيه عشان يتعمله استرداد.`, tab: 'payments' });
  if (r.holdings > 0) out.push({ id: 'review-holdings', level: 'bad', text: `${r.holdings} شراء حصص محتاج مراجعة (المشتري دفع والحصص خلصت): الغيه عشان يتعمله استرداد.`, tab: 'payments' });
  if (r.transfers > 0) out.push({ id: 'review-transfers', level: 'bad', text: `${r.transfers} عملية في سوق الحصص محتاجة مراجعة: ليها استرداد معلّق.`, tab: 'payments' });
  if (i.pendingPayouts.count > 0) out.push({ id: 'payouts', level: 'warn', text: `${i.pendingPayouts.count} مستحقات معلّقة (${round2(i.pendingPayouts.amount)} π) محتاجة تحويل منك.`, tab: 'payments' });
  if ((i.cardOrdersToHandOver ?? 0) > 0) out.push({ id: 'card-handover', level: 'warn', text: `${i.cardOrdersToHandOver} طلب اتدفع ببطاقة ومستني تسليم العقار للمشتري: المدفوعات ← طلبات البطاقة.`, tab: 'payments' });
  if ((i.cardRefunds ?? 0) > 0) out.push({ id: 'card-refunds', level: 'warn', text: `${i.cardRefunds} استرداد بالبطاقة محتاج ترجّعه من لوحة شركة الدفع (مش بـ Pi): المدفوعات ← التحويلات والاستردادات.`, tab: 'payments' });
  if ((i.cardOrdersWithoutContract ?? 0) > 0) out.push({ id: 'card-no-contract', level: 'bad', text: `${i.cardOrdersWithoutContract} طلب بطاقة مدفوع من غير عقد (المشتري مش شايف حاجة في "العقود"): المدفوعات ← طلبات البطاقة ← زرار "ثبّت العقود". لو فشل راجع مفاتيح PI_ISSUER_* في Vercel.`, tab: 'payments' });
  if (i.chainAccount) out.push({ id: 'chain-account', level: i.chainAccount === 'low_balance' ? 'warn' : 'bad', text: CHAIN_ACCOUNT_TEXT[i.chainAccount], tab: 'payments' });
  if ((i.cardContractsUnanchored ?? 0) > 0) out.push({ id: 'card-contracts', level: 'warn', text: `${i.cardContractsUnanchored} عقد دفع بالبطاقة اتوقّع بس لسه مش متثبّت على البلوك تشين: المدفوعات ← طلبات البطاقة ← زرار "ثبّت العقود".`, tab: 'payments' });
  if ((i.kycPending ?? 0) > 0) {
    const h = Math.floor(i.kycOldestHours ?? 0);
    const late = h >= KYC_LATE_HOURS;
    out.push({ id: 'kyc-pending', level: late ? 'bad' : 'warn', text: `${i.kycPending} طلب تحقق هوية مستني مراجعتك${h >= 1 ? ` (أقدم واحد مستني من ${h >= 48 ? `${Math.floor(h / 24)} يوم` : `${h} ساعة`})` : ''}، ومستخدمو الويب مش هيقدروا يدفعوا قبل الموافقة${late ? ': اتأخر، راجعه النهاردة' : ''}: المدفوعات ← التحقق من الهوية.`, tab: 'payments' });
  }
  const m = i.shareMismatches ?? [];
  if (m.length > 0) out.push({ id: 'share-mismatch', level: 'warn', text: `${m.length} عقار عدّاد الحصص المباعة فيه مش مطابق لمشتريات المستثمرين (${m.slice(0, 3).join('، ')}${m.length > 3 ? '...' : ''}): راجعهم قبل ما تعدّل في الحصص.`, tab: 'payments' });
  if ((i.openReports ?? 0) > 0) out.push({ id: 'reports', level: 'warn', text: `${i.openReports} بلاغ على عقارات مستني مراجعتك (من صفحة العقار العامة): افتح لوحة التحكم ← بلاغات العقارات.`, tab: 'dashboard' });
  if ((i.incompleteListings ?? 0) > 0) out.push({ id: 'incomplete-listings', level: 'warn', text: `${i.incompleteListings} عقار ظاهر للزوار ناقصه صورة أو سعر أو موقع خريطة (زرار 📍 معطّل عندهم): افتح العقارات ← ناقصة البيانات.`, tab: 'properties' });
  if (i.env.ADMIN_TOTP_SECRET === false) out.push({ id: 'env-2fa', level: 'warn', text: 'دخول الأدمن بالـ PIN بس: فعّل التحقق بخطوتين (ADMIN_TOTP_SECRET). الخطوات في دليل التشغيل.', tab: 'dashboard' });
  if (i.env.ADMIN_PIN_STRONG === false) out.push({ id: 'env-pin', level: 'warn', text: 'الـ PIN بتاع الأدمن ضعيف (قصير أو أرقام بسيطة): غيّره في Vercel (ADMIN_PIN) لـ 10 حروف/أرقام أو أكتر، أو 8 فيها حروف وأرقام.', tab: 'dashboard' });
  if (i.env.ADMIN_ALERT_EMAIL === false) out.push({ id: 'env-alert', level: 'warn', text: 'مفيش إيميل تنبيهات أمنية: ضيف ADMIN_ALERT_EMAIL في Vercel عشان توصلك رسالة عند أي دخول جديد للأدمن.', tab: 'dashboard' });
  if (i.env.CRON_SECRET === false) out.push({ id: 'env-cron', level: 'warn', text: 'الملخص اليومي على الإيميل مش شغال: ضيف CRON_SECRET (نص عشوائي طويل) في Vercel.', tab: 'dashboard' });
  return out;
}
