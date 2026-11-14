import type { PartnerRole, PartnerStatus, CommissionStatus } from '@/lib/partners';

// Admin screens are in Arabic.
export const ROLE_AR: Record<PartnerRole, string> = { broker: 'وسيط عقاري', developer: 'مطوّر عقاري', investor: 'مستثمر', sales: 'مندوب مبيعات' };
export const PARTNER_STATUS_AR: Record<PartnerStatus, { label: string; tone: 'gold' | 'green' | 'red' | 'gray' }> = {
  pending: { label: 'قيد المراجعة', tone: 'gold' }, approved: { label: 'معتمد', tone: 'green' }, rejected: { label: 'مرفوض', tone: 'red' }, suspended: { label: 'موقوف', tone: 'gray' },
};
export const COMMISSION_STATUS_AR: Record<CommissionStatus, { label: string; tone: 'gold' | 'green' | 'red' }> = {
  accrued: { label: 'مستحقة', tone: 'gold' }, paid: { label: 'مدفوعة', tone: 'green' }, void: { label: 'ملغاة', tone: 'red' },
};
