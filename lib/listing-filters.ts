import type { NavLanguage } from './nav-i18n';
import { propertyPaymentAmount } from './payment-rules';

export type SortKey = 'newest' | 'priceAsc' | 'priceDesc';
export interface Filters { query: string; guests: number; maxPi: number | null; sort: SortKey }
export const EMPTY_FILTERS: Filters = { query: '', guests: 0, maxPi: null, sort: 'newest' };

export type FilterItem = { price?: unknown; currency?: unknown; payAmountPi?: unknown; maxGuests?: unknown };

// "150" or "150.5" -> number; empty or not a positive number -> null (no limit).
export function parseMaxPi(s: string): number | null {
  const n = Number(String(s).trim());
  return String(s).trim() !== '' && Number.isFinite(n) && n > 0 ? n : null;
}

export const isFiltered = (f: Filters) => f.query.trim() !== '' || f.guests > 0 || f.maxPi !== null || f.sort !== 'newest';

// Filters and sorts listings in the browser. A listing with no guest limit set, or whose price in Pi is unknown
// (USD price and no rate yet), is never hidden by that filter: the visitor can still open it.
export function filterListings<T extends FilterItem>(items: T[], f: Filters, piRate: number | null | undefined, textOf: (p: T) => string): T[] {
  const q = f.query.trim().toLowerCase();
  const piOf = (p: T) => propertyPaymentAmount(p as never, piRate);
  const out = items.filter((p) => {
    if (q && !textOf(p).toLowerCase().includes(q)) return false;
    const cap = Number(p.maxGuests);
    if (f.guests > 0 && Number.isInteger(cap) && cap >= 1 && cap < f.guests) return false;
    if (f.maxPi !== null) {
      const pi = piOf(p);
      if (pi !== null && pi > f.maxPi) return false;
    }
    return true;
  });
  if (f.sort === 'newest') return out;
  const dir = f.sort === 'priceAsc' ? 1 : -1;
  // Listings with an unknown price go last in both directions.
  return out
    .map((p, i) => ({ p, i, pi: piOf(p) }))
    .sort((a, b) => {
      if (a.pi === null && b.pi === null) return a.i - b.i;
      if (a.pi === null) return 1;
      if (b.pi === null) return -1;
      return (a.pi - b.pi) * dir || a.i - b.i;
    })
    .map((x) => x.p);
}

export interface FilterStrings {
  search: string; guests: string; anyGuests: string; maxPrice: string; sort: string;
  newest: string; priceAsc: string; priceDesc: string; clear: string; none: string; showing: string;
}
// {n} = shown, {m} = total.
export const FILTER_I18N: Record<NavLanguage, FilterStrings> = {
  en: { search: 'Search by name or place', guests: 'Guests', anyGuests: 'Any', maxPrice: 'Max price (π)', sort: 'Sort', newest: 'Newest', priceAsc: 'Price: low to high', priceDesc: 'Price: high to low', clear: 'Clear filters', none: 'No listings match your filters', showing: 'Showing {n} of {m}' },
  ar: { search: 'ابحث بالاسم أو المكان', guests: 'الضيوف', anyGuests: 'أي عدد', maxPrice: 'أقصى سعر (π)', sort: 'الترتيب', newest: 'الأحدث', priceAsc: 'السعر: من الأقل', priceDesc: 'السعر: من الأعلى', clear: 'امسح الفلاتر', none: 'مفيش نتائج بالفلاتر دي', showing: 'عرض {n} من {m}' },
  fr: { search: 'Rechercher un nom ou un lieu', guests: 'Voyageurs', anyGuests: 'Tous', maxPrice: 'Prix max (π)', sort: 'Trier', newest: 'Plus récents', priceAsc: 'Prix croissant', priceDesc: 'Prix décroissant', clear: 'Effacer les filtres', none: 'Aucune annonce ne correspond', showing: '{n} sur {m}' },
  es: { search: 'Buscar por nombre o lugar', guests: 'Huéspedes', anyGuests: 'Cualquiera', maxPrice: 'Precio máx. (π)', sort: 'Ordenar', newest: 'Más recientes', priceAsc: 'Precio: menor a mayor', priceDesc: 'Precio: mayor a menor', clear: 'Borrar filtros', none: 'Ningún anuncio coincide', showing: '{n} de {m}' },
  pt: { search: 'Buscar por nome ou local', guests: 'Hóspedes', anyGuests: 'Qualquer', maxPrice: 'Preço máx. (π)', sort: 'Ordenar', newest: 'Mais recentes', priceAsc: 'Preço: menor para maior', priceDesc: 'Preço: maior para menor', clear: 'Limpar filtros', none: 'Nenhum anúncio corresponde', showing: '{n} de {m}' },
  ur: { search: 'نام یا جگہ سے تلاش کریں', guests: 'مہمان', anyGuests: 'کوئی بھی', maxPrice: 'زیادہ سے زیادہ قیمت (π)', sort: 'ترتیب', newest: 'تازہ ترین', priceAsc: 'قیمت: کم سے زیادہ', priceDesc: 'قیمت: زیادہ سے کم', clear: 'فلٹر صاف کریں', none: 'کوئی اشتہار نہیں ملا', showing: '{m} میں سے {n}' },
  zh: { search: '按名称或地点搜索', guests: '客人数', anyGuests: '不限', maxPrice: '最高价格 (π)', sort: '排序', newest: '最新', priceAsc: '价格从低到高', priceDesc: '价格从高到低', clear: '清除筛选', none: '没有符合条件的房源', showing: '显示 {n} / {m}' },
};
export const filterStrings = (lang: string): FilterStrings => FILTER_I18N[lang as NavLanguage] ?? FILTER_I18N.en;
export const showingText = (lang: string, n: number, m: number) => filterStrings(lang).showing.replace('{n}', String(n)).replace('{m}', String(m));
