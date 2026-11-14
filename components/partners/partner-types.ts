import { Handshake, Building2, TrendingUp, Megaphone, type LucideIcon } from 'lucide-react';
import type { PartnerRole } from '@/lib/partners';
import type { PartnerTextKey } from '@/lib/partners-i18n';

export const ROLE_META: Record<PartnerRole, { icon: LucideIcon; name: PartnerTextKey; pitch: PartnerTextKey }> = {
  broker: { icon: Handshake, name: 'broker', pitch: 'brokerPitch' },
  developer: { icon: Building2, name: 'developer', pitch: 'developerPitch' },
  investor: { icon: TrendingUp, name: 'investor', pitch: 'investorPitch' },
  sales: { icon: Megaphone, name: 'sales', pitch: 'salesPitch' },
};

export type MyPartner = {
  profile: null | { role: PartnerRole; company: string; country: string; phone: string; about: string; website: string; listed: boolean; status: 'pending' | 'approved' | 'rejected' | 'suspended'; note: string };
  program: { enabled: boolean; rates: Record<PartnerRole, number> };
  invite: null | { code: string; invited: number; qualified: number };
  commissions: null | { totals: { currency: string; accrued: number; paid: number }[]; recent: { id: string; contractId: string; base: number; currency: string; rate: number; amount: number; status: 'accrued' | 'paid' | 'void'; createdAt: string | null }[] };
};
