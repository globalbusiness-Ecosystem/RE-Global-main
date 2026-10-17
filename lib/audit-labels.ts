// Arabic labels and one-line summaries for the admin activity log (pure, no server imports).

export const AUDIT_LABELS: Record<string, string> = {
  'property.create': 'إضافة عقار', 'property.edit': 'تعديل عقار', 'property.toggle': 'تغيير حالة عقار', 'property.delete': 'حذف عقار',
  'user.ban': 'حظر مستخدم', 'user.unban': 'إلغاء حظر مستخدم',
  'booking.cancel': 'إلغاء حجز', 'shares.cancel': 'إلغاء حصص مستثمر', 'market.listing.cancel': 'إلغاء عرض في سوق الحصص',
  'market.fee': 'تعديل عمولة إعادة البيع', 'pricing.rate': 'تعديل سعر Pi/USD', 'payout.paid': 'تعليم مستحق كمدفوع',
  'content.create': 'إضافة محتوى', 'content.update': 'تعديل محتوى', 'content.delete': 'حذف محتوى', 'content.toggle': 'تفعيل/إيقاف محتوى',
  'admin.login': 'تسجيل دخول الأدمن', 'admin.revoke': 'خروج من كل جلسات الأدمن', 'admin.backup': 'تصدير نسخة احتياطية',
  'legal.save': 'حفظ إعدادات قانونية', 'texts.save': 'حفظ نصوص الموقع',
};

export function auditLabel(action: string): string {
  return AUDIT_LABELS[action] ?? action;
}

const s = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v).slice(0, 80) : '');

// A short, safe summary of what the action touched (only known fields, never the whole detail object).
export function auditSummary(action: string, detail: Record<string, unknown> | null | undefined): string {
  const d = detail ?? {};
  switch (action) {
    case 'booking.cancel': return [s(d.title), d.guest ? `@${s(d.guest)}` : '', d.refund != null ? `استرداد ${s(d.refund)} π` : ''].filter(Boolean).join(' · ');
    case 'shares.cancel': return [s(d.title), d.buyer ? `@${s(d.buyer)}` : '', d.shares != null ? `${s(d.shares)} حصة` : '', d.refund != null ? `استرداد ${s(d.refund)} π` : ''].filter(Boolean).join(' · ');
    case 'market.listing.cancel': return [s(d.title), d.seller ? `@${s(d.seller)}` : ''].filter(Boolean).join(' · ');
    case 'market.fee': return `${s(d.from)}% ← ${s(d.to)}%`;
    case 'pricing.rate': return `${s(d.from)} ← ${s(d.to)}`;
    case 'payout.paid': return [s(d.id), s(d.note)].filter(Boolean).join(' · ');
    case 'user.ban': case 'user.unban': return [d.username ? `@${s(d.username)}` : '', s(d.reason)].filter(Boolean).join(' · ');
    case 'legal.save': return s(d.country);
    case 'texts.save': return [s(d.page), s(d.lang)].filter(Boolean).join(' · ');
    default: return s(d.title) || s(d.username) || s(d.id) || s(d.kind);
  }
}
