'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import { Bed, Maximize2, Heart, MapPin, Camera, Zap, Image as ImageIcon, QrCode } from 'lucide-react';
import { CategoryGradient } from './category-gradient';
import { PropertyImagesCarousel, PropertyImage } from './property-images-carousel';
import AIPriceEstimate from './ai-price-estimate-modal';
import { QRCodeModal } from './qr-code-modal';
import { QRPaymentButton } from './qr-payment-button';

interface PropertyCardProps {
  id: string;
  titleEn: string;
  titleAr: string;
  price: number;
  city: string;
  country: string;
  countryFlag: string;
  bedrooms: number;
  area: number;
  category?: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized' | 'abroad' | 'offplan';
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  language: 'en' | 'ar';
  onPropertyClick?: (id: string) => void;
  panoramaUrl?: string;
  onTourClick?: (id: string) => void;
  images?: PropertyImage[];
}

export const PropertyCard = memo(
  ({
    id,
    titleEn,
    titleAr,
    price,
    city,
    country,
    countryFlag,
    bedrooms,
    area,
    category = 'buy',
    isFavorite,
    onToggleFavorite,
    language,
    onPropertyClick,
    panoramaUrl,
    onTourClick,
    images = [],
  }: PropertyCardProps) => {
    const [priceEstimateOpen, setPriceEstimateOpen] = useState(false);
    const [qrCodeOpen, setQrCodeOpen] = useState(false);
    const hasImages = images && images.length > 0;

    const displayTitle = useMemo(
      () => (language === 'en' ? titleEn : titleAr),
      [language, titleEn, titleAr]
    );

    const formattedPrice = useMemo(
      () => price.toLocaleString('en-US'),
      [price]
    );

    const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onToggleFavorite(id);
    }, [id, onToggleFavorite]);

    const handleCardClick = useCallback(() => {
      onPropertyClick?.(id);
    }, [id, onPropertyClick]);

    const handleTourClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onTourClick?.(id);
    }, [id, onTourClick]);

    const handlePriceEstimate = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPriceEstimateOpen(true);
    }, []);

    return (
      <div
        onClick={handleCardClick}
        className="group relative bg-gradient-to-br from-background/50 to-background/20 rounded-2xl overflow-hidden border border-accent/10 hover:border-accent/40 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20 cursor-pointer"
      >
        {/* Image Container or Gradient Fallback */}
        <div className="relative w-full h-40 overflow-hidden">
          {hasImages ? (
            <PropertyImagesCarousel
              images={images}
              className="w-full h-40"
            />
          ) : (
            <CategoryGradient 
              category={category} 
              className="w-full h-40 group-hover:scale-110 transition-transform duration-500"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-accent hover:text-background rounded-full transition-all duration-200 z-10 group-hover:scale-110"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite
                  ? 'fill-accent text-accent'
                  : 'text-foreground'
              }`}
            />
          </button>

          {/* Image Count Badge */}
          {hasImages && (
            <div className="absolute top-2 left-2 p-2 bg-gold hover:bg-yellow-300 text-black rounded-full transition-all duration-200 z-10 group-hover:scale-110 font-bold flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs font-bold">{images.length}</span>
            </div>
          )}

          {/* VR Tour Button */}
          {panoramaUrl && (
            <button
              onClick={handleTourClick}
              className="absolute top-2 left-12 p-2 bg-accent hover:bg-accent/90 text-black rounded-full transition-all duration-200 z-10 group-hover:scale-110 font-bold"
              aria-label="VR 360° tour"
              title="Start VR Tour"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          {/* Location Badge */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
            <span>{countryFlag}</span>
            <span className="text-foreground">{country}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-bold text-sm line-clamp-2 text-foreground group-hover:text-accent transition-colors">
            {displayTitle}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{city}</span>
          </div>

          {/* Price */}
          <div className="text-accent font-bold text-sm">
            {formattedPrice}π
          </div>

          {/* Stats */}
          <div className="flex gap-3 pt-2 border-t border-border/30">
            {bedrooms > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bed className="w-3 h-3" />
                <span>{bedrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Maximize2 className="w-3 h-3" />
              <span>{area}m²</span>
            </div>
          </div>

          {/* AI Price Estimate Button */}
          <button
            onClick={handlePriceEstimate}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-secondary/20 hover:bg-secondary/40 text-secondary-foreground border border-secondary/30 hover:border-secondary/60 rounded-lg transition-all duration-200 text-xs font-medium"
          >
            <Zap className="w-3 h-3" />
            {language === 'en' ? 'AI Price' : 'سعر ذكي'}
          </button>

          {/* QR Payment Button and View QR Code Button */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <QRPaymentButton
              propertyId={id}
              language={language}
              className="col-span-1"
              onSuccess={() => {
                console.log('[v0] QR payment successful for property:', id);
              }}
              onError={(error) => {
                console.log('[v0] QR payment error:', error.message);
              }}
            />
            <button
              onClick={() => setQrCodeOpen(true)}
              className="col-span-1 flex items-center justify-center gap-2 py-2 bg-accent/20 hover:bg-accent/40 text-accent border border-accent/30 hover:border-accent/60 rounded-lg transition-all duration-200 text-xs font-medium"
              title={language === 'en' ? 'View QR Code' : 'عرض رمز QR'}
            >
              <QrCode className="w-3 h-3" />
              {language === 'en' ? 'View QR' : 'عرض QR'}
            </button>
          </div>
        </div>

        {/* AI Price Estimate Modal */}
        <AIPriceEstimate
          isOpen={priceEstimateOpen}
          onClose={() => setPriceEstimateOpen(false)}
          propertyTitle={displayTitle}
          listedPrice={price}
          city={city}
          language={language}
          category={category}
        />

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={qrCodeOpen}
          onClose={() => setQrCodeOpen(false)}
          propertyId={id}
          propertyName={displayTitle}
          price={price}
          city={city}
          bedrooms={bedrooms}
          area={area}
          language={language}
        />
      </div>
    );
  },
  // Custom comparison for optimal memoization
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.price === nextProps.price &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.language === nextProps.language &&
      prevProps.titleEn === nextProps.titleEn &&
      prevProps.titleAr === nextProps.titleAr &&
      prevProps.city === nextProps.city &&
      prevProps.country === nextProps.country &&
      prevProps.bedrooms === nextProps.bedrooms &&
      prevProps.area === nextProps.area &&
      prevProps.category === nextProps.category &&
      prevProps.panoramaUrl === nextProps.panoramaUrl &&
      prevProps.images?.length === nextProps.images?.length
    );
  }
);

PropertyCard.displayName = 'PropertyCard';
