import type { NavLanguage } from './nav-i18n';

// The Contracts page used to stack everything in one long scroll. These are its tabs: the contract list (with search and
// the QR scanner) comes first; the guest's own bookings / properties / shares / money owed sit one tap away.
export type ContractsTab = 'contracts' | 'bookings' | 'properties' | 'shares' | 'owed';
export type AssetSection = Exclude<ContractsTab, 'contracts'>;
export type AssetCounts = Record<AssetSection, number>;

export const NO_ASSETS: AssetCounts = { bookings: 0, properties: 0, shares: 0, owed: 0 };
const ORDER: AssetSection[] = ['bookings', 'properties', 'shares', 'owed'];

export const TAB_LABELS: Record<NavLanguage, Record<ContractsTab, string>> = {
  en: { contracts: 'Contracts', bookings: 'Bookings', properties: 'Properties', shares: 'Shares', owed: 'Owed to me' },
  ar: { contracts: 'العقود', bookings: 'حجوزاتي', properties: 'ممتلكاتي', shares: 'حصصي', owed: 'مستحقاتي' },
  fr: { contracts: 'Contrats', bookings: 'Réservations', properties: 'Biens', shares: 'Parts', owed: 'À recevoir' },
  es: { contracts: 'Contratos', bookings: 'Reservas', properties: 'Propiedades', shares: 'Participaciones', owed: 'Por cobrar' },
  pt: { contracts: 'Contratos', bookings: 'Reservas', properties: 'Imóveis', shares: 'Cotas', owed: 'A receber' },
  ur: { contracts: 'معاہدے', bookings: 'میری بکنگز', properties: 'میری جائیدادیں', shares: 'میرے حصص', owed: 'میرے واجبات' },
  zh: { contracts: '合同', bookings: '我的预订', properties: '我的房产', shares: '我的份额', owed: '待收款' },
};

/** Contracts is always there; the other tabs show up only when the guest has something in them. */
export function visibleTabs(counts: AssetCounts): ContractsTab[] {
  return ['contracts', ...ORDER.filter((s) => (counts[s] ?? 0) > 0)];
}

/** If the open tab is no longer available (its items disappeared), go back to Contracts. */
export function safeTab(tab: ContractsTab, counts: AssetCounts): ContractsTab {
  return visibleTabs(counts).includes(tab) ? tab : 'contracts';
}
