'use client';

import { useState } from 'react';
import { EMPTY_FILTERS, filterStrings, isFiltered, parseMaxPi, showingText, type Filters, type SortKey } from '@/lib/listing-filters';

// Search, guest count, price cap and sort for a list of listings. The filtering itself is done by the page (filterListings).
export function ListingFilters({ value, onChange, language, shown, total, showGuests = true }: {
  value: Filters; onChange: (f: Filters) => void; language: string; shown: number; total: number; showGuests?: boolean;
}) {
  const t = filterStrings(language);
  const [maxText, setMaxText] = useState('');
  const cls = 'w-full rounded-lg bg-black/30 border border-white/10 p-2 text-sm text-white';
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });
  return (
    <div className="mb-4 space-y-2 rounded-xl border border-white/10 p-3">
      <input type="search" value={value.query} onChange={(e) => set({ query: e.target.value })} placeholder={t.search} aria-label={t.search} className={cls} />
      <div className="grid grid-cols-3 gap-2">
        {showGuests && (
          <label className="text-xs text-gray-400">{t.guests}
            <select value={value.guests} onChange={(e) => set({ guests: Number(e.target.value) })} className={cls}>
              <option value={0}>{t.anyGuests}</option>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </label>
        )}
        <label className="text-xs text-gray-400">{t.maxPrice}
          <input inputMode="decimal" value={maxText} onChange={(e) => { setMaxText(e.target.value); set({ maxPi: parseMaxPi(e.target.value) }); }} className={cls} />
        </label>
        <label className="text-xs text-gray-400">{t.sort}
          <select value={value.sort} onChange={(e) => set({ sort: e.target.value as SortKey })} className={cls}>
            <option value="newest">{t.newest}</option>
            <option value="priceAsc">{t.priceAsc}</option>
            <option value="priceDesc">{t.priceDesc}</option>
          </select>
        </label>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{showingText(language, shown, total)}</span>
        {isFiltered(value) && (
          <button type="button" onClick={() => { setMaxText(''); onChange(EMPTY_FILTERS); }} className="text-accent underline">{t.clear}</button>
        )}
      </div>
      {shown === 0 && total > 0 && <p className="text-sm text-gray-300" role="status">{t.none}</p>}
    </div>
  );
}
