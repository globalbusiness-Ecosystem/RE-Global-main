/**
 * Global Map Configuration & Utilities
 * Supports worldwide real estate marketplace with regional analysis
 */

export const GLOBAL_REGIONS = {
  asia: {
    name: 'Asia',
    center: [20, 105],
    bounds: [[5, 70], [55, 150]],
    countries: ['Thailand', 'Indonesia', 'Japan', 'Vietnam', 'Singapore', 'Hong Kong'],
    color: '#3b82f6',
    timezone: 'UTC+8',
  },
  europe: {
    name: 'Europe',
    center: [54, 15],
    bounds: [[35, -10], [70, 40]],
    countries: ['France', 'UK', 'Spain', 'Germany', 'Austria', 'Netherlands', 'Denmark', 'Norway', 'Sweden', 'Belgium', 'Italy', 'Portugal'],
    color: '#8b5cf6',
    timezone: 'UTC+1',
  },
  americas: {
    name: 'Americas',
    center: [0, -100],
    bounds: [[-55, -170], [80, -50]],
    countries: ['USA', 'Brazil'],
    color: '#06b6d4',
    timezone: 'UTC-5',
  },
  africa: {
    name: 'Africa',
    center: [0, 20],
    bounds: [[-35, -20], [37, 55]],
    countries: ['Egypt', 'Kenya', 'South Africa'],
    color: '#f97316',
    timezone: 'UTC+3',
  },
  'middle-east': {
    name: 'Middle East',
    center: [27, 42],
    bounds: [[12, 25], [42, 60]],
    countries: ['UAE', 'Iraq', 'Jordan', 'Saudi Arabia', 'Qatar'],
    color: '#ec4899',
    timezone: 'UTC+3',
  },
} as const;

export const MARKET_INSIGHTS = {
  bullish: {
    color: '#10b981',
    trend: '📈',
    label: 'Bullish Market',
    description: 'More properties trending up than down',
  },
  bearish: {
    color: '#ef4444',
    trend: '📉',
    label: 'Bearish Market',
    description: 'More properties trending down than up',
  },
  neutral: {
    color: '#f59e0b',
    trend: '➡️',
    label: 'Neutral Market',
    description: 'Balanced market activity',
  },
} as const;

export const PROPERTY_TYPE_COLORS = {
  buy: '#3b82f6',
  rent: '#a855f7',
  hotel: '#f59e0b',
  invest: '#10b981',
} as const;

export const GLOBAL_STATS_LABELS = {
  en: {
    properties: 'Global Properties',
    countries: 'Countries Covered',
    volume: 'Total π Volume',
    bullish: 'Bullish Signals',
    bearish: 'Bearish Signals',
    avgROI: 'Average ROI',
    topRegion: 'Top Region',
    trendingCity: 'Trending City',
    marketMomentum: 'Market Momentum',
  },
  ar: {
    properties: 'العقارات العالمية',
    countries: 'الدول المغطاة',
    volume: 'إجمالي حجم π',
    bullish: 'إشارات صعودية',
    bearish: 'إشارات هبوطية',
    avgROI: 'متوسط العائد',
    topRegion: 'أفضل منطقة',
    trendingCity: 'مدينة رائجة',
    marketMomentum: 'زخم السوق',
  },
} as const;

export const HEATMAP_GRADIENT = {
  0.0: '#0000ff',      // Blue - Cold
  0.25: '#00ff00',     // Green - Warm
  0.5: '#ffff00',      // Yellow - Hot
  0.75: '#ff8800',     // Orange - Very Hot
  1.0: '#ff0000',      // Red - Extremely Hot
} as const;

export const MAP_TILES = {
  default: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB',
  },
} as const;

export function getRegionStats(properties: any[], region: string) {
  const regionConfig = GLOBAL_REGIONS[region as keyof typeof GLOBAL_REGIONS];
  if (!regionConfig) return null;

  const regionProps = properties.filter(p => regionConfig.countries.includes(p.country));
  const totalValue = regionProps.reduce((sum, p) => sum + p.price, 0);
  const avgROI = regionProps.length > 0 
    ? Math.round(regionProps.reduce((sum, p) => sum + (p.roiScore || 0), 0) / regionProps.length)
    : 0;

  const upCount = regionProps.filter(p => p.marketTrend === 'up').length;
  const downCount = regionProps.filter(p => p.marketTrend === 'down').length;
  const trend = upCount > downCount ? 'up' : downCount > upCount ? 'down' : 'stable';

  return {
    count: regionProps.length,
    avgROI,
    totalValue,
    trend,
    properties: regionProps,
  };
}

export function getMarketMomentum(properties: any[]) {
  const upCount = properties.filter(p => p.marketTrend === 'up').length;
  const downCount = properties.filter(p => p.marketTrend === 'down').length;
  
  if (upCount > downCount) return 'bullish';
  if (downCount > upCount) return 'bearish';
  return 'neutral';
}

export function formatMarketData(value: number, type: 'price' | 'roi' | 'volume') {
  switch (type) {
    case 'price':
      return value > 1000 ? `${(value / 1000).toFixed(1)}K` : `${value}`;
    case 'roi':
      return `${value}%`;
    case 'volume':
      return value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`;
    default:
      return value.toString();
  }
}
