import type { NavLanguage } from './nav-i18n';

// What a contract is FOR, as the guest understands it: a sale, an investment, a rent, or a hotel stay.
// The stored `type` cannot say this on its own: hotel stays are signed as 'buy' (the signing route maps them), and share
// purchases may be 'buy' too. So the kind is worked out from the type plus the "Stay:" / "Shares:" lines that the signed text
// carries. Pure, and it works for contracts signed before this existed.
export type ContractKind = 'sale' | 'invest' | 'rent' | 'hotel';
export const CONTRACT_KINDS: ContractKind[] = ['sale', 'invest', 'rent', 'hotel'];

export function contractKind(c: { type?: string; contractText?: string }): ContractKind {
  const text = c.contractText ?? '';
  if (c.type === 'invest' || c.type === 'tokenized' || /(^|\n)Shares: /.test(text)) return 'invest';
  if (c.type === 'rent') return 'rent';
  if (/(^|\n)Stay: /.test(text)) return 'hotel';
  return 'sale';
}

export const KIND_ICON: Record<ContractKind, string> = { sale: '🏠', invest: '📈', rent: '🔑', hotel: '🏨' };
export const KIND_STYLE: Record<ContractKind, string> = {
  sale: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  invest: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rent: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  hotel: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export const KIND_LABELS: Record<NavLanguage, Record<ContractKind, string>> = {
  en: { sale: 'Sale', invest: 'Investment', rent: 'Rent', hotel: 'Hotel stay' },
  ar: { sale: 'بيع', invest: 'استثمار', rent: 'إيجار', hotel: 'فندق' },
  fr: { sale: 'Vente', invest: 'Investissement', rent: 'Location', hotel: 'Séjour hôtel' },
  es: { sale: 'Venta', invest: 'Inversión', rent: 'Alquiler', hotel: 'Estancia en hotel' },
  pt: { sale: 'Venda', invest: 'Investimento', rent: 'Aluguel', hotel: 'Estadia em hotel' },
  ur: { sale: 'فروخت', invest: 'سرمایہ کاری', rent: 'کرایہ', hotel: 'ہوٹل قیام' },
  zh: { sale: '出售', invest: '投资', rent: '租赁', hotel: '酒店住宿' },
};

// Display wording for the contract view and its PDF (the page is English-only). This does not touch the signed text.
export const KIND_TITLE: Record<ContractKind, string> = {
  sale: 'RE Global — Property Sale Contract',
  invest: 'RE Global — Property Investment Contract',
  rent: 'RE Global — Property Rental Contract',
  hotel: 'RE Global — Hotel Stay Contract',
};
export const KIND_PARTY: Record<ContractKind, string> = { sale: 'Buyer', invest: 'Investor', rent: 'Tenant', hotel: 'Guest' };
