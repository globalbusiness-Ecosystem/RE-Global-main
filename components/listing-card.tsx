'use client';

import { memo, useState } from 'react';
import { Bed, Maximize2, MapPin, Heart, Video } from 'lucide-react';
import type { NavLanguage } from '@/lib/nav-i18n';
import { pTitle, pLocation, type Property } from '@/lib/useProperties';
import { formatPropertyPrice } from '@/lib/price-format';
import { formatNumber } from '@/lib/format';
import { countryFlag } from '@/lib/flags';
import { FOCUS_KEY, focusFromProperty } from '@/lib/map-focus';
import { propertyPaymentAmount } from '@/lib/payment-rules';
import { isExclusiveType } from '@/lib/property-lifecycle';
import { usePiRate } from '@/lib/usePiRate';
import { CARD_I18N } from '@/lib/card-i18n';
import { PriceUsd } from '@/components/price-usd';
import { PropertyQRCode } from '@/components/property-qr-code';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { PanoramaModal } from '@/components/panorama-modal';

function txType(t: string): 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized' {
  if (t === 'rent') return 'rent';
  if (t === 'hotel') return 'hotel';
  if (t === 'invest' || t === 'offplan') return 'invest';
  if (t === 'tokenized') return 'tokenized';
  return 'buy';
}

// A property added from the admin panel, shown in full: photo, flag, favorite, price, QR, pay, map and 360 tour.
export const ListingCard = memo(function ListingCard({
  prop, language, isFavorite, onToggleFavorite, onOpenDetails,
}: { prop: Property; language: NavLanguage; isFavorite?: boolean; onToggleFavorite?: () => void; onOpenDetails?: () => void }) {
  const t = CARD_I18N[language] ?? CARD_I18N.en;
  const piRate = usePiRate();
  const [tour, setTour] = useState(false);
  const title = pTitle(prop, language);
  const place = pLocation(prop, language);
  const image = prop.image || prop.images?.[0];
  const flag = countryFlag(prop.country);
  const sold = isExclusiveType(prop.type) && prop.status === 'sold';
  const focus = focusFromProperty({ id: prop.id, lat: prop.lat, lng: prop.lng, title });
  const payPi = propertyPaymentAmount(prop, piRate);

  const openMap = () => {
    if (!focus) return;
    try { sessionStorage.setItem(FOCUS_KEY, JSON.stringify(focus)); } catch { /* private mode: the map just opens */ }
    window.dispatchEvent(new CustomEvent('navigateToPage', { detail: 'map' }));
  };
  const iconBtn = 'border border-accent text-accent py-2 rounded-lg font-semibold hover:bg-accent/10 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {image && (
          <img loading="lazy" src={image} alt={title} onClick={onOpenDetails} className={`w-full h-full object-cover hover:scale-105 transition-transform ${onOpenDetails ? 'cursor-pointer' : ''}`} />
        )}
        {onToggleFavorite && (
          <button type="button" onClick={onToggleFavorite} aria-label={t.favorite} aria-pressed={!!isFavorite} className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 rounded-full p-2 transition">
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-accent text-accent' : 'text-white'}`} />
          </button>
        )}
        {prop.featured && <div className="absolute top-3 left-3 rounded bg-accent px-2 py-0.5 text-xs font-bold text-black">{t.featured}</div>}
        {flag && <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-sm font-semibold">{flag}</div>}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 onClick={onOpenDetails} className={`font-bold text-lg line-clamp-1 ${onOpenDetails ? 'cursor-pointer hover:text-accent' : ''}`}>{title}</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{place}</span>
            </div>
          </div>
          {onOpenDetails && (
            <button type="button" onClick={onOpenDetails} className="shrink-0 rounded border border-accent/50 px-2 py-0.5 text-xs text-accent hover:bg-accent/10">{t.details}</button>
          )}
        </div>

        {(!!prop.bedrooms || !!prop.area) && (
          <div className="flex gap-3 text-sm text-muted-foreground">
            {!!prop.bedrooms && <div className="flex items-center gap-1"><Bed className="w-4 h-4" /><span>{prop.bedrooms}</span></div>}
            {!!prop.area && <div className="flex items-center gap-1"><Maximize2 className="w-4 h-4" /><span>{formatNumber(prop.area, language)} m²</span></div>}
          </div>
        )}

        <div className="border-t border-border pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t.price}</p>
            <p className="text-xl font-bold text-accent">{formatPropertyPrice(prop, language)}</p>
            <PriceUsd prop={prop} className="text-xs text-muted-foreground" />
          </div>
          <div className="flex flex-col items-end">
            <PropertyQRCode propertyId={prop.id} size={52} className="rounded" />
            <p className="text-[10px] text-muted-foreground font-mono mt-1" dir="ltr">#{prop.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          {sold ? (
            <div className="col-span-1 flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 py-2 text-sm text-red-300">{t.sold}</div>
          ) : (
            <UnifiedPaymentButton
              propertyId={prop.id}
              propertyTitle={title}
              price={prop.price}
              transactionType={txType(prop.type)}
              amountPi={payPi ?? undefined}
              language={language}
              currency="PI"
              className="col-span-1"
            />
          )}
          <button type="button" onClick={openMap} disabled={!focus} className={iconBtn} title={focus ? t.viewMap : t.noMap} aria-label={focus ? t.viewMap : t.noMap}>📍</button>
          <button type="button" onClick={() => setTour(true)} disabled={!prop.vrUrl} className={iconBtn} title={prop.vrUrl ? t.tour : t.noTour} aria-label={prop.vrUrl ? t.tour : t.noTour}>
            <Video className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
      {tour && prop.vrUrl && <PanoramaModal url={prop.vrUrl} title={title} language={language} onClose={() => setTour(false)} />}
    </div>
  );
});
