import type { Favorite, SmartContract } from './firebase-database';
import type { Property } from './useProperties';
import type { AlertI18n } from './alert-labels';

export interface SmartAlert {
  id: string;
  type: 'price-up' | 'price-down' | 'contract-status' | 'recommendation' | 'stay' | 'payout';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  createdAt: Date;
  propertyId?: string;
  // Same texts in all 7 languages; the page shows these and falls back to the En/Ar pair when absent.
  i18n?: AlertI18n;
}

export function generateSmartAlerts(
  favorites: Favorite[],
  properties: Property[],
  contracts: SmartContract[]
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const propertyById = new Map(properties.map((p) => [p.id, p]));

  for (const fav of favorites) {
    if (fav.priceAtFavorite === undefined) continue;
    const current = propertyById.get(fav.propertyId);
    if (!current) continue;
    const diff = current.price - fav.priceAtFavorite;
    if (diff === 0) continue;
    const pct = Math.round((diff / fav.priceAtFavorite) * 100);

    alerts.push({
      id: `price-${fav.id}`,
      type: diff < 0 ? 'price-down' : 'price-up',
      titleEn: diff < 0 ? 'Price Drop' : 'Price Increase',
      titleAr: diff < 0 ? 'انخفاض في السعر' : 'ارتفاع في السعر',
      descriptionEn: `${current.title}: ${fav.priceAtFavorite.toLocaleString()} → ${current.price.toLocaleString()} (${pct > 0 ? '+' : ''}${pct}%)`,
      descriptionAr: `${current.titleAr || current.title}: ${fav.priceAtFavorite.toLocaleString()} ← ${current.price.toLocaleString()} (${pct > 0 ? '+' : ''}${pct}%)`,
      createdAt: new Date(),
      propertyId: current.id,
      i18n: { title: diff < 0 ? 'priceDrop' : 'priceUp', description: 'priceChangeD', vars: { title: current.title, titleAr: current.titleAr, from: fav.priceAtFavorite.toLocaleString(), to: current.price.toLocaleString(), pct: `${pct > 0 ? '+' : ''}${pct}` } },
    });
  }

  for (const c of contracts) {
    if (c.status !== 'active' && c.status !== 'completed') continue;
    alerts.push({
      id: `contract-${c.id}`,
      type: 'contract-status',
      titleEn: c.status === 'active' ? 'Contract Active' : 'Contract Completed',
      titleAr: c.status === 'active' ? 'العقد نشط' : 'العقد مكتمل',
      descriptionEn: `${c.propertyTitle} — ${c.amount.toLocaleString()} ${c.currency}`,
      descriptionAr: `${c.propertyTitle} — ${c.amount.toLocaleString()} ${c.currency}`,
      createdAt: c.updatedAt,
      propertyId: c.propertyId,
      i18n: { title: c.status === 'active' ? 'contractActive' : 'contractDone', description: 'contractD', vars: { title: c.propertyTitle, amount: c.amount.toLocaleString(), currency: c.currency } },
    });
  }

  const favoriteIds = new Set(favorites.map((f) => f.propertyId));
  const favoriteProps = favorites
    .map((f) => propertyById.get(f.propertyId))
    .filter((p): p is Property => Boolean(p));

  const interestedTypes = new Set(favoriteProps.map((p) => p.type));
  const interestedLocations = new Set(favoriteProps.map((p) => p.location));

  const recommendations = properties.filter(
    (p) =>
      !favoriteIds.has(p.id) &&
      (interestedTypes.has(p.type) || interestedLocations.has(p.location))
  );

  for (const rec of recommendations.slice(0, 3)) {
    alerts.push({
      id: `rec-${rec.id}`,
      type: 'recommendation',
      titleEn: 'Matches Your Interests',
      titleAr: 'يطابق اهتماماتك',
      descriptionEn: `${rec.title} — ${rec.price.toLocaleString()} ${rec.currency || 'π'}`,
      descriptionAr: `${rec.titleAr || rec.title} — ${rec.price.toLocaleString()} ${rec.currency || 'π'}`,
      createdAt: new Date(),
      propertyId: rec.id,
      i18n: { title: 'recT', description: 'recD', vars: { title: rec.title, titleAr: rec.titleAr, price: rec.price.toLocaleString(), currency: rec.currency || 'π' } },
    });
  }

  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
