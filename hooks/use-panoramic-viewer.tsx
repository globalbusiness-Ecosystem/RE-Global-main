'use client';

import { useState, useCallback, useMemo } from 'react';
import { UltraPanormicViewer } from '@/components/ultra-panoramic-viewer';

interface PanoramicProperty {
  id: string;
  titleEn: string;
  titleAr: string;
  panoramaUrl?: string;
  city: string;
  country: string;
  category: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized' | 'abroad' | 'offplan';
}

interface UsePanormicViewerProps {
  language: 'en' | 'ar';
  region?: 'MENA' | 'EU' | 'NA' | 'ASIA' | 'AFRICA' | 'LATAM';
}

export function usePanormicViewer({ language, region = 'MENA' }: UsePanormicViewerProps) {
  const [activeProperty, setActiveProperty] = useState<PanoramicProperty | null>(null);

  const getRegionFromCountry = useCallback((country: string): 'MENA' | 'EU' | 'NA' | 'ASIA' | 'AFRICA' | 'LATAM' => {
    const regionMap: Record<string, 'MENA' | 'EU' | 'NA' | 'ASIA' | 'AFRICA' | 'LATAM'> = {
      // MENA
      'AE': 'MENA',
      'SA': 'MENA',
      'QA': 'MENA',
      'KW': 'MENA',
      'BH': 'MENA',
      'OM': 'MENA',
      'EG': 'MENA',
      'JO': 'MENA',
      'LB': 'MENA',
      'IL': 'MENA',
      // Europe
      'GB': 'EU',
      'FR': 'EU',
      'DE': 'EU',
      'IT': 'EU',
      'ES': 'EU',
      'CH': 'EU',
      'SE': 'EU',
      'NO': 'EU',
      'NL': 'EU',
      // North America
      'US': 'NA',
      'CA': 'NA',
      'MX': 'NA',
      // Asia
      'JP': 'ASIA',
      'SG': 'ASIA',
      'TH': 'ASIA',
      'CN': 'ASIA',
      'IN': 'ASIA',
      'KR': 'ASIA',
      // Africa
      'ZA': 'AFRICA',
      'NG': 'AFRICA',
      'KE': 'AFRICA',
      // Latin America
      'BR': 'LATAM',
      'AR': 'LATAM',
      'CL': 'LATAM',
    };
    return regionMap[country] || region;
  }, [region]);

  const handlePropertyClick = useCallback((property: PanoramicProperty) => {
    if (property.panoramaUrl) {
      setActiveProperty(property);
    }
  }, []);

  const handleClose = useCallback(() => {
    setActiveProperty(null);
  }, []);

  const ViewerComponent = useMemo(() => {
    if (!activeProperty?.panoramaUrl) return null;

    const propertyRegion = getRegionFromCountry(activeProperty.country);
    const title = language === 'en' ? activeProperty.titleEn : activeProperty.titleAr;

    return (
      <UltraPanormicViewer
        key={activeProperty.id}
        panoramaUrl={activeProperty.panoramaUrl}
        title={title}
        onClose={handleClose}
        quality="4k"
        enableAutoRotate={true}
        enableStats={true}
        region={propertyRegion}
      />
    );
  }, [activeProperty, language, getRegionFromCountry, handleClose]);

  return {
    activeProperty,
    ViewerComponent,
    handlePropertyClick,
    handleClose,
  };
}
