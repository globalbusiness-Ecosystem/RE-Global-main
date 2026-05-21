'use client';

import { memo, useState, useCallback } from 'react';
import { X, MapPin, Bed, Maximize2, Heart, Share2, Phone, Mail, Download } from 'lucide-react';
import { PropertyImagesCarousel, PropertyImage } from './property-images-carousel';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    titleEn: string;
    titleAr: string;
    descriptionEn?: string;
    descriptionAr?: string;
    price: number;
    city: string;
    country: string;
    countryFlag: string;
    bedrooms: number;
    bathrooms?: number;
    area: number;
    yearBuilt?: number;
    images: PropertyImage[];
    amenities?: string[];
    contact?: {
      name?: string;
      phone?: string;
      email?: string;
    };
  };
  language: 'en' | 'ar';
  onFavoriteClick?: () => void;
  isFavorite?: boolean;
  onBuyClick?: () => void;
}

export const PropertyDetailsModal = memo(
  ({
    isOpen,
    onClose,
    property,
    language,
    onFavoriteClick,
    isFavorite = false,
    onBuyClick
  }: PropertyDetailsModalProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const handleImageClick = useCallback((index: number) => {
      setSelectedImageIndex(index);
    }, []);

    if (!isOpen) return null;

    const title = language === 'en' ? property.titleEn : property.titleAr;
    const description = language === 'en' 
      ? property.descriptionEn 
      : property.descriptionAr;
    const formattedPrice = property.price.toLocaleString('en-US');

    const currentImage = property.images[selectedImageIndex];

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
        <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-accent/20">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-foreground truncate flex-1">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Main Image */}
            {property.images.length > 0 && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden group cursor-pointer">
                <img
                  src={currentImage.url}
                  alt={currentImage.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {property.images.length > 1 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-white text-sm font-medium">
                      {selectedImageIndex + 1} / {property.images.length}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200',
                      selectedImageIndex === idx
                        ? 'border-accent'
                        : 'border-border/30 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Price and Title */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">
                {formattedPrice}π
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{property.city}, {property.country} {property.countryFlag}</span>
              </div>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/30">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Bed className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? 'Bedrooms' : 'غرف النوم'}
                    </p>
                    <p className="text-sm font-semibold">{property.bedrooms}</p>
                  </div>
                </div>
              )}

              {property.bathrooms && property.bathrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Bed className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? 'Bathrooms' : 'الحمامات'}
                    </p>
                    <p className="text-sm font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
              )}

              {property.area > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Maximize2 className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? 'Area' : 'المساحة'}
                    </p>
                    <p className="text-sm font-semibold">{property.area}m²</p>
                  </div>
                </div>
              )}

              {property.yearBuilt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Maximize2 className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? 'Year Built' : 'سنة البناء'}
                    </p>
                    <p className="text-sm font-semibold">{property.yearBuilt}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="pt-4 border-t border-border/30">
                <p className="text-sm font-semibold mb-2">
                  {language === 'en' ? 'Amenities' : 'المرافق'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-secondary/20 text-secondary-foreground text-xs rounded-full border border-secondary/30"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {property.contact && (
              <div className="pt-4 border-t border-border/30 space-y-2">
                {property.contact.name && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{language === 'en' ? 'Agent' : 'الوكيل'}:</span> {property.contact.name}
                  </p>
                )}
                <div className="flex gap-2">
                  {property.contact.phone && (
                    <a
                      href={`tel:${property.contact.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors text-sm font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      {language === 'en' ? 'Call' : 'اتصل'}
                    </a>
                  )}
                  {property.contact.email && (
                    <a
                      href={`mailto:${property.contact.email}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors text-sm font-medium"
                    >
                      <Mail className="w-4 h-4" />
                      {language === 'en' ? 'Email' : 'بريد'}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border/30 flex gap-2">
              <Button
                onClick={onBuyClick}
                className="flex-1 bg-accent hover:bg-accent/90 text-black font-semibold"
              >
                {language === 'en' ? 'Buy Now' : 'اشتري الآن'}
              </Button>
              <button
                onClick={onFavoriteClick}
                className="p-2 hover:bg-secondary rounded-lg transition-colors border border-border/30"
              >
                <Heart
                  className={cn(
                    'w-5 h-5',
                    isFavorite ? 'fill-accent text-accent' : 'text-muted-foreground'
                  )}
                />
              </button>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors border border-border/30">
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PropertyDetailsModal.displayName = 'PropertyDetailsModal';
