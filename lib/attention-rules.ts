// What the admin should look at right now. Pure: takes plain counts and yes/no flags (never secret values).

export type AttentionInput = {
  env: { PI_API_KEY: boolean; PI_ISSUER_SECRET_KEY: boolean; PI_ISSUER_PUBLIC_KEY: boolean; ADMIN_SESSION_SECRET: boolean; ADMIN_TOTP_SECRET?: boolean };
  usdProperties: number;
  piRateSet: boolean;
  pendingPayouts: { count: number; amount: number };
  review: { bookings: number; holdings: number; transfers: number };
  /** Titles of properties whose sold-shares counter does not match the confirmed purchases. */
  shareMismatches?: string[];
};

export type AttentionItem = { id: string; level: 'bad' | 'warn'; text: string; tab: 'dashboard' | 'properties' | 'payments' | 'users' | 'content' };

const round2 = (n: number) => Math.round(n * 100) / 100;

// Items that stop money or contracts come first ("bad"), then things waiting on a person ("warn").
export function buildAttention(i: AttentionInput): AttentionItem[] {
  const out: AttentionItem[] = [];
  if (!i.env.PI_API_KEY) out.push({ id: 'env-pi-key', level: 'bad', text: 'مفتاح Pi API مش متضبط في Vercel: الدفع واقف.', tab: 'dashboard' });
  if (!i.env.PI_ISSUER_SECRET_KEY || !i.env.PI_ISSUER_PUBLIC_KEY) out.push({ id: 'env-signing', level: 'bad', text: 'مفاتيح توقيع العقود ناقصة في Vercel: العمليات مش هتتسجل ولا هيتعملها عقد.', tab: 'dashboard' });
  if (!i.env.ADMIN_SESSION_SECRET) out.push({ id: 'env-admin-secret', level: 'bad', text: 'ADMIN_SESSION_SECRET مش متضبط: جلسة الأدمن مش آمنة.', tab: 'dashboard' });
  if (i.usdProperties > 0 && !i.piRateSet) out.push({ id: 'rate', level: 'bad', text: `في ${i.usdProperties} عقار مسعّر بالدولار وسعر Pi مش متحدد: محدش يقدر يشتريهم. حدده من المحتوى ← 💱.`, tab: 'content' });
  const r = i.review;
  if (r.bookings > 0) out.push({ id: 'review-bookings', level: 'bad', text: `${r.bookings} حجز محتاج مراجعة (الضيف دفع والأيام اتاخدت): الغيه عشان يتعمله استرداد.`, tab: 'payments' });
  if (r.holdings > 0) out.push({ id: 'review-holdings', level: 'bad', text: `${r.holdings} شراء حصص محتاج مراجعة (المشتري دفع والحصص خلصت): الغيه عشان يتعمله استرداد.`, tab: 'payments' });
  if (r.transfers > 0) out.push({ id: 'review-transfers', level: 'bad', text: `${r.transfers} عملية في سوق الحصص محتاجة مراجعة: ليها استرداد معلّق.`, tab: 'payments' });
  if (i.pendingPayouts.count > 0) out.push({ id: 'payouts', level: 'warn', text: `${i.pendingPayouts.count} مستحقات معلّقة (${round2(i.pendingPayouts.amount)} π) محتاجة تحويل منك.`, tab: 'payments' });
  const m = i.shareMismatches ?? [];
  if (m.length > 0) out.push({ id: 'share-mismatch', level: 'warn', text: `${m.length} عقار عدّاد الحصص المباعة فيه مش مطابق لمشتريات المستثمرين (${m.slice(0, 3).join('، ')}${m.length > 3 ? '...' : ''}): راجعهم قبل ما تعدّل في الحصص.`, tab: 'payments' });
  if (i.env.ADMIN_TOTP_SECRET === false) out.push({ id: 'env-2fa', level: 'warn', text: 'دخول الأدمن بالـ PIN بس: فعّل التحقق بخطوتين (ADMIN_TOTP_SECRET). الخطوات في دليل التشغيل.', tab: 'dashboard' });
  return out;
}
