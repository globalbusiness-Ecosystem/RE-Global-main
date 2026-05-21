'use client';

/**
 * Unified Global Panoramic Integration Module
 * Provides seamless panoramic viewer integration across all sections
 */

import { UltraPanormicViewer } from '@/components/ultra-panoramic-viewer';

interface PanormicViewerStateProps {
  isOpen: boolean;
  propertyId: string;
  panoramaUrl: string;
  title: string;
  region: 'MENA' | 'EU' | 'NA' | 'ASIA' | 'AFRICA' | 'LATAM';
  quality: '1080p' | '2k' | '4k' | '6k' | '8k';
}

export const PanormicIntegration = {
  /**
   * Get region from country code
   */
  getRegion: (countryCode: string): 'MENA' | 'EU' | 'NA' | 'ASIA' | 'AFRICA' | 'LATAM' => {
    const regionMap: Record<string, 'MENA' | 'EU' | 'NA' | 'ASIA' | 'AFRICA' | 'LATAM'> = {
      // MENA Region
      'AE': 'MENA', 'SA': 'MENA', 'QA': 'MENA', 'KW': 'MENA', 'BH': 'MENA',
      'OM': 'MENA', 'EG': 'MENA', 'JO': 'MENA', 'LB': 'MENA', 'IL': 'MENA',
      'PS': 'MENA', 'SY': 'MENA', 'IQ': 'MENA', 'IR': 'MENA', 'TN': 'MENA',
      'MA': 'MENA', 'DZ': 'MENA', 'LY': 'MENA', 'SD': 'MENA', 'YE': 'MENA',
      // Europe
      'GB': 'EU', 'FR': 'EU', 'DE': 'EU', 'IT': 'EU', 'ES': 'EU', 'CH': 'EU',
      'SE': 'EU', 'NO': 'EU', 'NL': 'EU', 'BE': 'EU', 'AT': 'EU', 'PL': 'EU',
      'CZ': 'EU', 'PT': 'EU', 'GR': 'EU', 'DK': 'EU', 'FI': 'EU', 'IE': 'EU',
      // North America
      'US': 'NA', 'CA': 'NA', 'MX': 'NA',
      // Asia
      'JP': 'ASIA', 'SG': 'ASIA', 'TH': 'ASIA', 'CN': 'ASIA', 'IN': 'ASIA',
      'KR': 'ASIA', 'MY': 'ASIA', 'ID': 'ASIA', 'PH': 'ASIA', 'VN': 'ASIA',
      'PK': 'ASIA', 'BD': 'ASIA', 'LK': 'ASIA', 'MM': 'ASIA', 'KH': 'ASIA',
      // Africa
      'ZA': 'AFRICA', 'NG': 'AFRICA', 'KE': 'AFRICA', 'GH': 'AFRICA', 'TZ': 'AFRICA',
      'UG': 'AFRICA', 'ET': 'AFRICA', 'RW': 'AFRICA', 'CI': 'AFRICA', 'SN': 'AFRICA',
      // Latin America
      'BR': 'LATAM', 'AR': 'LATAM', 'CL': 'LATAM', 'CO': 'LATAM', 'PE': 'LATAM',
      'VE': 'LATAM', 'EC': 'LATAM', 'BO': 'LATAM', 'PY': 'LATAM', 'UY': 'LATAM',
    };
    return regionMap[countryCode] || 'MENA';
  },

  /**
   * Get recommended quality for region
   */
  getQualityForRegion: (region: string): '4k' | '2k' | '1080p' => {
    const qualityMap: Record<string, '4k' | '2k' | '1080p'> = {
      'MENA': '4k',
      'EU': '4k',
      'NA': '4k',
      'ASIA': '2k',
      'AFRICA': '2k',
      'LATAM': '2k',
    };
    return qualityMap[region] || '4k';
  },

  /**
   * Create panoramic viewer config
   */
  createConfig: (props: {
    panoramaUrl: string;
    title: string;
    countryCode: string;
    propertyId: string;
    language: 'en' | 'ar';
  }) => {
    const region = PanormicIntegration.getRegion(props.countryCode);
    const quality = PanormicIntegration.getQualityForRegion(region);

    return {
      panoramaUrl: props.panoramaUrl,
      title: props.title,
      region,
      quality,
      enableAutoRotate: true,
      enableStats: true,
      language: props.language,
    };
  },

  /**
   * Render panoramic viewer component
   */
  renderViewer: (props: {
    panoramaUrl: string;
    title: string;
    onClose: () => void;
    countryCode: string;
    propertyId: string;
    language: 'en' | 'ar';
  }) => {
    const config = PanormicIntegration.createConfig({
      panoramaUrl: props.panoramaUrl,
      title: props.title,
      countryCode: props.countryCode,
      propertyId: props.propertyId,
      language: props.language,
    });

    return (
      <UltraPanormicViewer
        panoramaUrl={config.panoramaUrl}
        title={config.title}
        onClose={props.onClose}
        quality={config.quality as any}
        enableAutoRotate={config.enableAutoRotate}
        enableStats={config.enableStats}
        region={config.region}
      />
    );
  },
};

export default PanormicIntegration;
