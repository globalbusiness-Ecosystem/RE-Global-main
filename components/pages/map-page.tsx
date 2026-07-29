'use client';

import { useProperties } from '@/lib/useProperties';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  ShoppingCart, Search, X, 
  MapPin, Star,
  Filter, Globe, Bed, Maximize2, TrendingUp,
  TrendingDown, Activity, DollarSign, Users, Zap, Target, Eye, Home, Video
} from 'lucide-react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { PropertyQRCode } from '@/components/property-qr-code';

// Leaflet lazy imports with performance optimization
let L: any;
let mapInitialized = false;
const markerClusterGroup = new Map(); // Cache for performance
const geoJsonCache = new Map(); // Cache for geojson layers

interface Property {
  id: number | string;
  lat: number;
  lng: number;
  title: string;
  titleAr: string;
  price: number;
  city: string;
  country: string;
  countryFlag: string;
  type: 'buy' | 'rent' | 'hotel' | 'invest';
  bedrooms: number;
  area: number;
  appreciation?: number;
  roiScore?: number;
  marketTrend?: 'up' | 'down' | 'stable';
  daysListed?: number;
}

// Property data - same as before
const properties: Property[] = [
  { id: 1, lat: 25.2048, lng: 55.2708, title: 'Luxury Villa Dubai', titleAr: 'فيلا فاخرة بدبي', price: 5000, city: 'Dubai', country: 'UAE', countryFlag: '🇦🇪', type: 'buy', bedrooms: 4, area: 500, appreciation: 12.5, roiScore: 85, marketTrend: 'up', daysListed: 14 },
  { id: 2, lat: 40.7128, lng: -74.006, title: 'Modern Apartment NYC', titleAr: 'شقة عصرية بنيويورك', price: 8000, city: 'New York', country: 'USA', countryFlag: '🇺🇸', type: 'buy', bedrooms: 3, area: 350, appreciation: 8.2, roiScore: 72, marketTrend: 'stable', daysListed: 28 },
  { id: 3, lat: 48.8566, lng: 2.3522, title: 'Parisian Apartment', titleAr: 'شقة باريسية', price: 6500, city: 'Paris', country: 'France', countryFlag: '🇫🇷', type: 'buy', bedrooms: 2, area: 280, appreciation: 6.8, roiScore: 68, marketTrend: 'stable', daysListed: 42 },
  { id: 4, lat: 51.5074, lng: -0.1278, title: 'London Townhouse', titleAr: 'منزل لندني', price: 7200, city: 'London', country: 'UK', countryFlag: '🇬🇧', type: 'buy', bedrooms: 3, area: 320, appreciation: 9.1, roiScore: 78, marketTrend: 'up', daysListed: 21 },
  { id: 5, lat: 35.6762, lng: 139.6503, title: 'Tokyo Penthouse', titleAr: 'شقة طوكيو الفاخرة', price: 9500, city: 'Tokyo', country: 'Japan', countryFlag: '🇯🇵', type: 'buy', bedrooms: 4, area: 450, appreciation: 5.3, roiScore: 65, marketTrend: 'down', daysListed: 35 },
  { id: 6, lat: 41.3874, lng: 2.169, title: 'Barcelona Villa', titleAr: 'فيلا برشلونة', price: 4500, city: 'Barcelona', country: 'Spain', countryFlag: '🇪🇸', type: 'buy', bedrooms: 3, area: 380, appreciation: 11.2, roiScore: 82, marketTrend: 'up', daysListed: 9 },
  { id: 7, lat: 8.6753, lng: 100.5037, title: 'Phuket Beach Villa', titleAr: 'فيلا شاطئ فوكيت', price: 120, city: 'Phuket', country: 'Thailand', countryFlag: '🇹🇭', type: 'rent', bedrooms: 2, area: 250, appreciation: 15.8, roiScore: 90, marketTrend: 'up', daysListed: 3 },
  { id: 8, lat: -8.6695, lng: 115.2126, title: 'Bali Beachfront', titleAr: 'واجهة بحرية بالية', price: 95, city: 'Bali', country: 'Indonesia', countryFlag: '🇮🇩', type: 'rent', bedrooms: 3, area: 320, appreciation: 14.5, roiScore: 88, marketTrend: 'up', daysListed: 5 },
  { id: 9, lat: 43.7102, lng: 7.2620, title: 'Cannes Seafront', titleAr: 'واجهة بحرية بكان', price: 450, city: 'Cannes', country: 'France', countryFlag: '🇫🇷', type: 'rent', bedrooms: 2, area: 200, appreciation: 7.2, roiScore: 70, marketTrend: 'stable', daysListed: 18 },
  { id: 10, lat: 37.7749, lng: -122.4194, title: 'SF Downtown Loft', titleAr: 'علية وسط سان فرانسيسكو', price: 380, city: 'San Francisco', country: 'USA', countryFlag: '🇺🇸', type: 'rent', bedrooms: 2, area: 180, appreciation: 10.5, roiScore: 79, marketTrend: 'up', daysListed: 12 },
  { id: 11, lat: -33.8688, lng: 151.2093, title: 'Sydney Opera View', titleAr: 'منظر دار الأوبرا بسيدني', price: 320, city: 'Sydney', country: 'Australia', countryFlag: '🇦🇺', type: 'rent', bedrooms: 2, area: 220, appreciation: 9.8, roiScore: 76, marketTrend: 'up', daysListed: 19 },
  { id: 12, lat: 21.0285, lng: 105.8541, title: 'Luxury Hanoi Resort', titleAr: 'منتجع هانوي الفاخر', price: 180, city: 'Hanoi', country: 'Vietnam', countryFlag: '🇻🇳', type: 'hotel', bedrooms: 1, area: 150, appreciation: 13.2, roiScore: 84, marketTrend: 'up', daysListed: 8 },
  { id: 13, lat: 13.7563, lng: 100.5018, title: 'Bangkok Grand Hotel', titleAr: 'فندق بانكوك الكبير', price: 160, city: 'Bangkok', country: 'Thailand', countryFlag: '🇹🇭', type: 'hotel', bedrooms: 1, area: 140, appreciation: 14.1, roiScore: 87, marketTrend: 'up', daysListed: 6 },
  { id: 14, lat: 1.3521, lng: 103.8198, title: 'Singapore Premier', titleAr: 'سنغافورة بريمير', price: 200, city: 'Singapore', country: 'Singapore', countryFlag: '🇸🇬', type: 'hotel', bedrooms: 1, area: 160, appreciation: 6.5, roiScore: 67, marketTrend: 'stable', daysListed: 31 },
  { id: 15, lat: 22.3193, lng: 114.1694, title: 'Hong Kong Tower', titleAr: 'برج هونغ كونغ', price: 220, city: 'Hong Kong', country: 'Hong Kong', countryFlag: '🇭🇰', type: 'hotel', bedrooms: 1, area: 170, appreciation: 4.2, roiScore: 58, marketTrend: 'down', daysListed: 45 },
  { id: 16, lat: -23.5505, lng: -46.6333, title: 'São Paulo Urban', titleAr: 'ساو باولو الحضرية', price: 140, city: 'São Paulo', country: 'Brazil', countryFlag: '🇧🇷', type: 'hotel', bedrooms: 1, area: 130, appreciation: 12.8, roiScore: 83, marketTrend: 'up', daysListed: 11 },
  { id: 17, lat: 30.0444, lng: 31.2357, title: 'Cairo Tower Investment', titleAr: 'استثمار برج القاهرة', price: 3500, city: 'Cairo', country: 'Egypt', countryFlag: '🇪🇬', type: 'invest', bedrooms: 5, area: 600, appreciation: 16.5, roiScore: 92, marketTrend: 'up', daysListed: 2 },
  { id: 18, lat: 33.3128, lng: 44.3615, title: 'Baghdad Commerce Hub', titleAr: 'مركز بغداد التجاري', price: 2800, city: 'Baghdad', country: 'Iraq', countryFlag: '🇮🇶', type: 'invest', bedrooms: 4, area: 500, appreciation: 18.3, roiScore: 95, marketTrend: 'up', daysListed: 1 },
  { id: 19, lat: 24.4539, lng: 54.3773, title: 'Abu Dhabi Trade Zone', titleAr: 'منطقة تجارة أبوظبي', price: 4200, city: 'Abu Dhabi', country: 'UAE', countryFlag: '🇦🇪', type: 'invest', bedrooms: 6, area: 700, appreciation: 13.7, roiScore: 86, marketTrend: 'up', daysListed: 4 },
  { id: 20, lat: 31.9454, lng: 35.9284, title: 'Amman Business Center', titleAr: 'مركز عمّان للأعمال', price: 2200, city: 'Amman', country: 'Jordan', countryFlag: '🇯🇴', type: 'invest', bedrooms: 4, area: 450, appreciation: 15.2, roiScore: 89, marketTrend: 'up', daysListed: 3 },
  { id: 21, lat: 33.3157, lng: 44.3661, title: 'Riyadh Corporate Plaza', titleAr: 'بلازا الرياض للشركات', price: 3800, city: 'Riyadh', country: 'Saudi Arabia', countryFlag: '🇸🇦', type: 'invest', bedrooms: 5, area: 550, appreciation: 14.6, roiScore: 88, marketTrend: 'up', daysListed: 5 },
  { id: 22, lat: 25.2854, lng: 51.5310, title: 'Doha Investment Tower', titleAr: 'برج الدوحة للاستثمار', price: 4600, city: 'Doha', country: 'Qatar', countryFlag: '🇶🇦', type: 'invest', bedrooms: 6, area: 650, appreciation: 11.9, roiScore: 81, marketTrend: 'up', daysListed: 7 },
  { id: 23, lat: 39.7392, lng: -104.9903, title: 'Denver Penthouse', titleAr: 'شقة دنفر الفاخرة', price: 2500, city: 'Denver', country: 'USA', countryFlag: '🇺🇸', type: 'buy', bedrooms: 3, area: 300, appreciation: 10.8, roiScore: 80, marketTrend: 'up', daysListed: 15 },
  { id: 24, lat: 47.6062, lng: -122.3321, title: 'Seattle Modern Home', titleAr: 'منزل سياتل العصري', price: 3200, city: 'Seattle', country: 'USA', countryFlag: '🇺🇸', type: 'buy', bedrooms: 3, area: 320, appreciation: 9.5, roiScore: 77, marketTrend: 'up', daysListed: 20 },
  { id: 25, lat: 34.0522, lng: -118.2437, title: 'LA Contemporary', titleAr: 'لوس أنجلس المعاصرة', price: 3800, city: 'Los Angeles', country: 'USA', countryFlag: '🇺🇸', type: 'buy', bedrooms: 4, area: 400, appreciation: 8.9, roiScore: 75, marketTrend: 'stable', daysListed: 26 },
  { id: 26, lat: 33.7490, lng: -84.3880, title: 'Atlanta Luxury', titleAr: 'أتلانتا الفاخرة', price: 2000, city: 'Atlanta', country: 'USA', countryFlag: '🇺🇸', type: 'rent', bedrooms: 2, area: 250, appreciation: 11.3, roiScore: 81, marketTrend: 'up', daysListed: 13 },
  { id: 27, lat: 41.8781, lng: -87.6298, title: 'Chicago Skyrise', titleAr: 'شيكاغو سكاي رايز', price: 2200, city: 'Chicago', country: 'USA', countryFlag: '🇺🇸', type: 'rent', bedrooms: 2, area: 280, appreciation: 10.2, roiScore: 78, marketTrend: 'up', daysListed: 17 },
  { id: 28, lat: 25.7617, lng: -80.1918, title: 'Miami Beach House', titleAr: 'منزل شاطئ ميامي', price: 280, city: 'Miami', country: 'USA', countryFlag: '🇺🇸', type: 'hotel', bedrooms: 2, area: 200, appreciation: 9.7, roiScore: 77, marketTrend: 'up', daysListed: 16 },
  { id: 29, lat: 52.5200, lng: 13.4050, title: 'Berlin Luxury Apt', titleAr: 'برلين شقة فاخرة', price: 3000, city: 'Berlin', country: 'Germany', countryFlag: '🇩🇪', type: 'buy', bedrooms: 2, area: 280, appreciation: 7.5, roiScore: 71, marketTrend: 'stable', daysListed: 33 },
  { id: 30, lat: 48.2082, lng: 16.3738, title: 'Vienna Palace', titleAr: 'قصر فيينا', price: 4000, city: 'Vienna', country: 'Austria', countryFlag: '🇦🇹', type: 'buy', bedrooms: 4, area: 350, appreciation: 6.8, roiScore: 68, marketTrend: 'stable', daysListed: 40 },
  { id: 31, lat: 46.9479, lng: 7.4474, title: 'Bern Executive Suite', titleAr: 'جناح بيرن التنفيذي', price: 150, city: 'Bern', country: 'Switzerland', countryFlag: '🇨🇭', type: 'hotel', bedrooms: 1, area: 120, appreciation: 5.1, roiScore: 62, marketTrend: 'stable', daysListed: 50 },
  { id: 32, lat: 52.3667, lng: 4.9945, title: 'Amsterdam Canal House', titleAr: 'منزل أمستردام القناة', price: 3500, city: 'Amsterdam', country: 'Netherlands', countryFlag: '🇳🇱', type: 'buy', bedrooms: 3, area: 300, appreciation: 7.2, roiScore: 70, marketTrend: 'stable', daysListed: 37 },
  { id: 33, lat: 55.6761, lng: 12.5683, title: 'Copenhagen Penthouse', titleAr: 'شقة كوبنهاغن الفاخرة', price: 130, city: 'Copenhagen', country: 'Denmark', countryFlag: '🇩🇰', type: 'hotel', bedrooms: 1, area: 140, appreciation: 6.3, roiScore: 66, marketTrend: 'stable', daysListed: 48 },
  { id: 34, lat: 59.9139, lng: 10.7522, title: 'Oslo Modern Villa', titleAr: 'فيلا أوسلو العصرية', price: 4200, city: 'Oslo', country: 'Norway', countryFlag: '🇳🇴', type: 'buy', bedrooms: 3, area: 380, appreciation: 7.8, roiScore: 72, marketTrend: 'stable', daysListed: 38 },
  { id: 35, lat: 59.3293, lng: 18.0686, title: 'Stockholm Waterfront', titleAr: 'ستوكهولم واجهة مائية', price: 200, city: 'Stockholm', country: 'Sweden', countryFlag: '🇸🇪', type: 'hotel', bedrooms: 1, area: 150, appreciation: 6.9, roiScore: 69, marketTrend: 'stable', daysListed: 44 },
  { id: 36, lat: 50.8503, lng: 4.3517, title: 'Brussels Elite', titleAr: 'بروكسل النخبة', price: 2800, city: 'Brussels', country: 'Belgium', countryFlag: '🇧🇪', type: 'buy', bedrooms: 2, area: 260, appreciation: 6.4, roiScore: 65, marketTrend: 'stable', daysListed: 41 },
  { id: 37, lat: 48.8566, lng: 2.3522, title: 'Paris Boutique Hotel', titleAr: 'بوتيك فندق باريس', price: 180, city: 'Paris', country: 'France', countryFlag: '🇫🇷', type: 'hotel', bedrooms: 1, area: 110, appreciation: 5.8, roiScore: 64, marketTrend: 'stable', daysListed: 43 },
  { id: 38, lat: 40.4168, lng: -3.7038, title: 'Madrid Luxury Flat', titleAr: 'شقة مدريد الفاخرة', price: 2400, city: 'Madrid', country: 'Spain', countryFlag: '🇪🇸', type: 'buy', bedrooms: 2, area: 240, appreciation: 10.1, roiScore: 78, marketTrend: 'up', daysListed: 22 },
  { id: 39, lat: 41.3851, lng: 2.1734, title: 'Barcelona Investment', titleAr: 'استثمار برشلونة', price: 3200, city: 'Barcelona', country: 'Spain', countryFlag: '🇪🇸', type: 'invest', bedrooms: 4, area: 400, appreciation: 12.3, roiScore: 83, marketTrend: 'up', daysListed: 6 },
  { id: 40, lat: 43.2965, lng: 5.3698, title: 'Marseille Harbour', titleAr: 'ميناء مارسيليا', price: 110, city: 'Marseille', country: 'France', countryFlag: '🇫🇷', type: 'hotel', bedrooms: 1, area: 100, appreciation: 6.2, roiScore: 64, marketTrend: 'stable', daysListed: 47 },
  { id: 41, lat: 45.4642, lng: 9.1900, title: 'Milan Fashion Hub', titleAr: 'ميلان مركز الموضة', price: 3800, city: 'Milan', country: 'Italy', countryFlag: '🇮🇹', type: 'invest', bedrooms: 4, area: 420, appreciation: 11.5, roiScore: 80, marketTrend: 'up', daysListed: 10 },
  { id: 42, lat: 41.9028, lng: 12.4964, title: 'Rome Ancient Luxury', titleAr: 'روما الفخامة القديمة', price: 3400, city: 'Rome', country: 'Italy', countryFlag: '🇮🇹', type: 'buy', bedrooms: 3, area: 310, appreciation: 8.7, roiScore: 74, marketTrend: 'stable', daysListed: 29 },
  { id: 43, lat: 40.7580, lng: 14.4891, title: 'Naples Coastal', titleAr: 'نابولي الساحلية', price: 95, city: 'Naples', country: 'Italy', countryFlag: '🇮🇹', type: 'hotel', bedrooms: 1, area: 90, appreciation: 9.2, roiScore: 75, marketTrend: 'up', daysListed: 25 },
  { id: 44, lat: 38.7169, lng: -9.1395, title: 'Lisbon Riverside', titleAr: 'لشبونة ضفة النهر', price: 150, city: 'Lisbon', country: 'Portugal', countryFlag: '🇵🇹', type: 'hotel', bedrooms: 1, area: 130, appreciation: 8.4, roiScore: 73, marketTrend: 'up', daysListed: 24 },
  { id: 45, lat: -33.9249, lng: 18.4241, title: 'Cape Town View Apartment', titleAr: 'شقة كيب تاون بمنظر', price: 2100, city: 'Cape Town', country: 'South Africa', countryFlag: '🇿🇦', type: 'buy', bedrooms: 2, area: 260, appreciation: 12.9, roiScore: 84, marketTrend: 'up', daysListed: 8 },
  { id: 46, lat: -1.2864, lng: 36.8172, title: 'Nairobi Elite Residence', titleAr: 'إقامة نيروبي النخبة', price: 85, city: 'Nairobi', country: 'Kenya', countryFlag: '🇰🇪', type: 'hotel', bedrooms: 1, area: 100, appreciation: 14.7, roiScore: 89, marketTrend: 'up', daysListed: 4 },
];

async function initializeMap() {
  if (mapInitialized) return;
  
  try {
    L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');
    mapInitialized = true;
  } catch (error) {
    console.error('Failed to load Leaflet:', error);
    toast.error('Failed to load map. Please refresh and try again.');
  }
}

interface MapPageProps {
  language: 'en' | 'ar';
  onPropertySelect?: (propertyId: number | string) => void;
}

interface RegionStats {
  name: string;
  count: number;
  avgPrice: number;
  avgROI: number;
  totalValue: number;
  trend: 'up' | 'down' | 'stable';
  topCity: string;
}

export default function MapPage({ language = 'en', onPropertySelect }: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'rent' | 'hotel' | 'invest'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'roi' | 'trending'>('price');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'global' | 'regional'>('global');
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [marketView, setMarketView] = useState<'markers' | 'heatmap' | 'clusters'>('markers');
  const [showPanoramicTour, setShowPanoramicTour] = useState(false);
  const updateThrottleRef = useRef(0);

  const { properties: firebaseProps } = useProperties();

  const filteredProperties = useMemo(() => {
    const allProperties: Property[] = [...properties, ...firebaseProps.filter(p => p.lat && p.lng).map(p => ({...p, titleAr: p.titleAr || p.title, city: p.location || "", country: "", countryFlag: "🏠", bedrooms: p.bedrooms || 0, area: p.area || 0, roiScore: 80, appreciation: 10, marketTrend: "up" as const, daysListed: 1} as Property))];
    let filtered = allProperties.filter((p) => {
      const matchType = filterType === 'all' || p.type === filterType;
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.titleAr.includes(searchTerm) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchCountry = selectedCountries.length === 0 || selectedCountries.includes(p.country);
      return matchType && matchSearch && matchPrice && matchCountry;
    });

    // Sort
    if (sortBy === 'roi') {
      filtered.sort((a, b) => (b.roiScore || 0) - (a.roiScore || 0));
    } else if (sortBy === 'trending') {
      filtered.sort((a, b) => {
        const trendOrder = { up: 0, stable: 1, down: 2 };
        return (trendOrder[a.marketTrend || 'stable'] || 2) - (trendOrder[b.marketTrend || 'stable'] || 2);
      });
    } else {
      filtered.sort((a, b) => a.price - b.price);
    }

    return filtered;
  }, [properties, firebaseProps, filterType, searchTerm, priceRange, selectedCountries, sortBy]);

  const countries = useMemo(() => {
    const unique = Array.from(new Set(properties.map(p => p.country))).sort();
    return unique;
  }, []);

  const mapStats = useMemo(() => {
    const countries = new Set(filteredProperties.map((p) => p.country));
    const totalValue = filteredProperties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const upTrend = filteredProperties.filter(p => p.marketTrend === 'up').length;
    const downTrend = filteredProperties.filter(p => p.marketTrend === 'down').length;
    
    return {
      totalProperties: filteredProperties.length,
      countriesAvailable: countries.size,
      totalValue,
      avgPrice: filteredProperties.length > 0 ? Math.round(totalValue / filteredProperties.length) : 0,
      avgROI: filteredProperties.length > 0 ? Math.round(filteredProperties.reduce((sum, p) => sum + (p.roiScore || 0), 0) / filteredProperties.length) : 0,
      upTrend,
      downTrend,
      marketMomentum: upTrend > downTrend ? 'bullish' : downTrend > upTrend ? 'bearish' : 'neutral',
    };
  }, [filteredProperties]);

  const regionStats = useMemo(() => {
    const regionMap = {
      'asia': ['Thailand', 'Indonesia', 'Japan', 'Vietnam', 'Singapore', 'Hong Kong'],
      'europe': ['France', 'UK', 'Spain', 'Germany', 'Austria', 'Netherlands', 'Denmark', 'Norway', 'Sweden', 'Belgium', 'Italy', 'Portugal'],
      'americas': ['USA', 'Brazil'],
      'africa': ['Egypt', 'Kenya', 'South Africa'],
      'middle-east': ['UAE', 'Iraq', 'Jordan', 'Saudi Arabia', 'Qatar'],
    };

    const stats: Record<string, RegionStats> = {};
    
    Object.entries(regionMap).forEach(([region, countries]) => {
      const regionProps = filteredProperties.filter(p => countries.includes(p.country));
      const totalValue = regionProps.reduce((sum, p) => sum + p.price, 0);
      const avgROI = regionProps.length > 0 ? Math.round(regionProps.reduce((sum, p) => sum + (p.roiScore || 0), 0) / regionProps.length) : 0;
      
      const upCount = regionProps.filter(p => p.marketTrend === 'up').length;
      const downCount = regionProps.filter(p => p.marketTrend === 'down').length;
      const trend: 'up' | 'down' | 'stable' = upCount > downCount ? 'up' : downCount > upCount ? 'down' : 'stable';
      
      const cities = new Set(regionProps.map(p => p.city));
      const topCity = regionProps.length > 0 ? regionProps.reduce((a, b) => (b.roiScore || 0) > (a.roiScore || 0) ? b : a).city : '';

      stats[region] = {
        name: region.charAt(0).toUpperCase() + region.slice(1).replace('-', ' '),
        count: regionProps.length,
        avgPrice: regionProps.length > 0 ? Math.round(totalValue / regionProps.length) : 0,
        avgROI,
        totalValue,
        trend,
        topCity,
      };
    });

    return stats;
  }, [filteredProperties]);

  const initMapOnDemand = useCallback(async () => {
    if (mapInitialized || !mapContainerRef.current || mapInstanceRef.current) return;
    
    try {
      await initializeMap();
      
      if (!L) return;
      
      const map = L.map(mapContainerRef.current, {
        preferCanvas: true,
        zoomControl: false,
        renderer: L.canvas(),
        worldCopyJump: true,
      }).setView([20, 10], 3);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
        minZoom: 2,
        crossOrigin: 'anonymous',
        className: 'map-tile'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const handleMapEvent = () => {
        try {
          const bounds = map.getBounds();
        } catch (e) {
          console.error('Map event error:', e);
        }
      };
      
      map.on('moveend zoomend', handleMapEvent);

      mapInstanceRef.current = map;
      updateMarkers(map);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please refresh and try again.');
    }
  }, []);

  const updateMarkers = useCallback((map: any) => {
    if (!map) return;

    // Throttle updates to prevent excessive redraws
    const now = Date.now();
    if (now - updateThrottleRef.current < 300) return;
    updateThrottleRef.current = now;

    // Remove old markers efficiently
    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        // Marker already removed
      }
    });
    markersRef.current = [];

    if (filteredProperties.length === 0) return;

    // Heatmap data for geographic visualization
    if (heatmapEnabled && L.heatLayer) {
      const heatData = filteredProperties.map(p => [
        p.lat,
        p.lng,
        p.roiScore ? (p.roiScore / 100) : 0.5
      ]);
      
      if (markerClusterGroup.has('heatmap')) {
        map.removeLayer(markerClusterGroup.get('heatmap'));
      }
      
      const heatLayer = L.heatLayer(heatData, {
        radius: 40,
        blur: 35,
        maxZoom: 17,
        gradient: {
          0.0: '#0000ff',
          0.5: '#00ff00',
          1.0: '#ff0000'
        }
      }).addTo(map);
      
      markerClusterGroup.set('heatmap', heatLayer);
    }

    // Add markers with performance optimization
    const colorMap = {
      buy: '#3b82f6',
      rent: '#a855f7',
      hotel: '#f59e0b',
      invest: '#10b981',
    };

    filteredProperties.forEach((property) => {
      try {
        const handleMarkerClick = () => {
          setSelectedProperty(property);
          setShowDetailPanel(true);
          onPropertySelect?.(property.id);
        };
        
        const marker = L.circleMarker([property.lat, property.lng], {
          radius: 8,
          fillColor: colorMap[property.type],
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
          className: 'map-marker'
        }).addTo(map);

        marker.on('click', handleMarkerClick);

        markersRef.current.push(marker);
      } catch (e) {
        console.error('Error adding marker:', e);
      }
    });
  }, [filteredProperties, language, onPropertySelect, heatmapEnabled]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers(mapInstanceRef.current);
    }
  }, [updateMarkers]);

  // Auto-initialize map when component mounts
  useEffect(() => {
    initMapOnDemand();
  }, [initMapOnDemand]);

  // Tour guide navigation functions
  const navigateToRegion = useCallback((region: 'asia' | 'europe' | 'americas' | 'africa' | 'middle-east') => {
    try {
      if (!mapInstanceRef.current) return;
      
      const regionBounds = {
        asia: [[5, 70], [55, 150]],
        europe: [[35, -10], [70, 40]],
        americas: [[-55, -170], [80, -50]],
        africa: [[-35, -20], [37, 55]],
        'middle-east': [[12, 25], [42, 60]],
      };
      
      const bounds = L.latLngBounds(regionBounds[region]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], duration: 1000 });
      setViewMode('regional');
    } catch (error) {
      console.error('Navigation to region error:', error);
      toast.error('Could not navigate to region. Please try again.');
    }
  }, []);

  const startGlobalTour = useCallback(() => {
    try {
      if (!mapInstanceRef.current) return;
      mapInstanceRef.current.flyTo([20, 0], 3, { duration: 2 });
      setViewMode('global');
      setFilterType('all');
    } catch (error) {
      console.error('Global tour error:', error);
      toast.error('Could not start tour. Please try again.');
    }
  }, []);

  const focusOnTopProperty = useCallback(() => {
    try {
      if (!filteredProperties.length || !mapInstanceRef.current) return;
      
      const topProperty = filteredProperties.reduce((a, b) => 
        (b.roiScore || 0) > (a.roiScore || 0) ? b : a
      );
      
      mapInstanceRef.current.flyTo([topProperty.lat, topProperty.lng], 12, { duration: 1.5 });
      setSelectedProperty(topProperty);
    } catch (error) {
      console.error('Focus on property error:', error);
      toast.error('Could not focus on property. Please try again.');
    }
  }, [filteredProperties]);

  const toggleHeader = useCallback(() => {
    try {
      setHeaderVisible(prev => !prev);
      setTimeout(() => {
        try {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        } catch (e) {
          console.error('Map resize error:', e);
        }
      }, 350);
    } catch (error) {
      console.error('Toggle header error:', error);
      toast.error('Could not toggle header. Please try again.');
    }
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 flex flex-col">
      {/* Toggle Button & Market Status */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-lg border-b border-accent/10 p-3 flex justify-between items-center">
        <button
          onClick={toggleHeader}
          className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-xs transition"
          title={headerVisible ? 'Collapse header' : 'Expand header'}
        >
          <span>{headerVisible ? '▲' : '▼'}</span>
          <span className="text-gray-300">{headerVisible ? 'Hide' : 'Show'}</span>
        </button>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Market:</span>
          <span className={`font-semibold flex items-center gap-1 ${
            mapStats.marketMomentum === 'bullish' ? 'text-green-400' : 
            mapStats.marketMomentum === 'bearish' ? 'text-red-400' : 
            'text-yellow-400'
          }`}>
            {mapStats.marketMomentum === 'bullish' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {mapStats.marketMomentum.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Collapsible Header with Stats & Filters */}
      <div
        id="mapHeader"
        style={{
          maxHeight: headerVisible ? '300px' : '0px',
          transition: 'max-height 0.3s ease',
          overflow: 'hidden',
        }}
        className="sticky top-12 z-20 bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-lg border-b border-accent/10"
      >
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs mb-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Home className="w-3 h-3 text-blue-400" />
                <span className="text-accent font-bold text-sm">{mapStats.totalProperties}</span>
              </div>
              <div className="text-gray-400 text-xs">Properties</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Globe className="w-3 h-3 text-purple-400" />
                <span className="text-accent font-bold text-sm">{mapStats.countriesAvailable}</span>
              </div>
              <div className="text-gray-400 text-xs">Countries</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-amber-400" />
                <span className="text-accent font-bold text-sm">{Math.floor(mapStats.totalValue / 1000)}K</span>
              </div>
              <div className="text-gray-400 text-xs">Volume</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-accent font-bold text-sm">{mapStats.upTrend}</span>
              </div>
              <div className="text-gray-400 text-xs">Bullish</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-accent font-bold text-sm">{mapStats.downTrend}</span>
              </div>
              <div className="text-gray-400 text-xs">Bearish</div>
            </div>
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-pink-400" />
                <span className="text-accent font-bold text-sm">{mapStats.avgROI}%</span>
              </div>
              <div className="text-gray-400 text-xs">Avg ROI</div>
            </div>
          </div>

          {/* Regional Performance Cards */}
          <div className="mb-3 pb-3 border-b border-gray-800">
            <label className="text-xs text-gray-400 mb-2 block font-semibold">Regional Performance</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(regionStats).map(([key, stats]) => {
                const isSelected = selectedRegion === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRegion(isSelected ? null : key)}
                    className={`p-2 rounded border transition text-xs ${
                      isSelected
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-semibold">{stats.name}</div>
                    <div className="text-xs">{stats.count} · ROI {stats.avgROI}%</div>
                    <div className={`text-xs flex items-center justify-center gap-1 ${
                      stats.trend === 'up' ? 'text-green-400' : stats.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {stats.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stats.topCity}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'ابحث...' : 'Search properties...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-2 transition"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {(['all', 'buy', 'rent', 'hotel', 'invest'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    try {
                      setFilterType(type);
                    } catch (error) {
                      console.error('Filter error:', error);
                      toast.error('Could not apply filter. Please try again.');
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs whitespace-nowrap transition ${
                    filterType === type
                      ? 'bg-accent text-black font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Market View Controls */}
            <div className="flex gap-1 mt-2">
              {(['markers', 'heatmap', 'clusters'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => {
                    try {
                      setMarketView(view);
                      if (view === 'heatmap') {
                        setHeatmapEnabled(true);
                      } else {
                        setHeatmapEnabled(false);
                      }
                    } catch (error) {
                      console.error('Market view error:', error);
                      toast.error('Could not change view. Please try again.');
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs flex-1 transition ${
                    marketView === view
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {view === 'markers' && <MapPin className="w-3 h-3 inline mr-1" />}
                  {view === 'heatmap' && <Activity className="w-3 h-3 inline mr-1" />}
                  {view === 'clusters' && <Users className="w-3 h-3 inline mr-1" />}
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="sticky top-24 z-20 bg-black/90 border-b border-accent/10 p-4 space-y-3">
          {/* Price Range */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Price Range: {priceRange[0]} - {priceRange[1]}π</label>
            <input
              type="range"
              min="0"
              max="10000"
              value={priceRange[1]}
              onChange={(e) => {
                try {
                  setPriceRange([priceRange[0], parseInt(e.target.value)]);
                } catch (error) {
                  console.error('Price range error:', error);
                  toast.error('Could not update price range. Please try again.');
                }
              }}
              className="w-full"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Sort By</label>
            <div className="flex gap-2">
              {(['price', 'roi', 'trending'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    try {
                      setSortBy(opt);
                    } catch (error) {
                      console.error('Sort error:', error);
                      toast.error('Could not apply sort. Please try again.');
                    }
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    sortBy === opt ? 'bg-accent text-black' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Countries</label>
            <div className="grid grid-cols-3 gap-1">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => {
                    try {
                      setSelectedCountries(prev =>
                        prev.includes(country)
                          ? prev.filter(c => c !== country)
                          : [...prev, country]
                      );
                    } catch (error) {
                      console.error('Country selection error:', error);
                      toast.error('Could not update country selection. Please try again.');
                    }
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    selectedCountries.includes(country)
                      ? 'bg-accent text-black'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {country.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Tour Controls */}
      <div className="sticky top-24 md:top-32 z-20 bg-gradient-to-r from-black/90 to-black/80 backdrop-blur-lg border-b border-accent/10 p-3 overflow-x-auto">
        <div className="flex gap-2 items-center min-w-max flex-wrap">
          <button
            onClick={startGlobalTour}
            className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-accent to-purple-600 text-black rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-accent/50 transition"
          >
            <Globe className="w-4 h-4" />
            {language === 'ar' ? 'جولة عالمية' : 'Global Tour'}
          </button>

          <button
            onClick={focusOnTopProperty}
            className="flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition"
          >
            <Star className="w-4 h-4 text-yellow-400" />
            {language === 'ar' ? 'الأفضل' : 'Top ROI'}
          </button>

          {/* Region Quick Navigation */}
          <div className="border-l border-gray-700 pl-2 ml-2 flex gap-1 flex-wrap">
            {(['asia', 'europe', 'americas', 'africa', 'middle-east'] as const).map((region) => {
              const stats = regionStats[region];
              return (
                <button
                  key={region}
                  onClick={() => navigateToRegion(region)}
                  className={`px-2 py-1 rounded text-xs transition ${
                    selectedRegion === region
                      ? 'bg-accent text-black font-semibold'
                      : 'bg-gray-800/50 hover:bg-gray-700 text-gray-300'
                  }`}
                  title={`${region}: ${stats.count} properties, ${stats.avgROI}% ROI`}
                >
                  {region.substring(0, 2).toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Market View Controls */}
          <div className="border-l border-gray-700 pl-2 ml-2 flex gap-1">
            <button
              onClick={() => {
                try {
                  setMarketView('markers');
                  setHeatmapEnabled(false);
                } catch (error) {
                  console.error('View error:', error);
                  toast.error('Could not change view.');
                }
              }}
              className={`px-2 py-1 rounded text-xs transition ${
                marketView === 'markers'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-800/50 hover:bg-gray-700 text-gray-300'
              }`}
              title="Marker view"
            >
              📍
            </button>
            <button
              onClick={() => {
                try {
                  setMarketView('heatmap');
                  setHeatmapEnabled(true);
                } catch (error) {
                  console.error('View error:', error);
                  toast.error('Could not change view.');
                }
              }}
              className={`px-2 py-1 rounded text-xs transition ${
                marketView === 'heatmap'
                  ? 'bg-red-600 text-white font-semibold'
                  : 'bg-gray-800/50 hover:bg-gray-700 text-gray-300'
              }`}
              title="Heatmap view"
            >
              🔥
            </button>
            <button
              onClick={() => {
                try {
                  setMarketView('clusters');
                  setHeatmapEnabled(false);
                } catch (error) {
                  console.error('View error:', error);
                  toast.error('Could not change view.');
                }
              }}
              className={`px-2 py-1 rounded text-xs transition ${
                marketView === 'clusters'
                  ? 'bg-green-600 text-white font-semibold'
                  : 'bg-gray-800/50 hover:bg-gray-700 text-gray-300'
              }`}
              title="Cluster view"
            >
              👥
            </button>
          </div>

          {/* Stats Toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`border-l border-gray-700 pl-2 ml-2 px-2 py-1 rounded text-xs transition ${
              showStats ? 'text-accent' : 'text-gray-400'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            {language === 'ar' ? 'إحصائيات' : 'Stats'}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Property Marker Popup */}
        {selectedProperty && showDetailPanel === false && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
            <div 
              className="bg-gradient-to-b from-[#1a1410]/95 to-[#0f0b08]/95 backdrop-blur-md border border-[#F59E0B]/30 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 p-1 hover:bg-[#F59E0B]/10 rounded transition-colors"
              >
                <X className="w-5 h-5 text-[#F59E0B]" />
              </button>

              {/* Property Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  {language === 'ar' ? selectedProperty.titleAr : selectedProperty.title}
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  {selectedProperty.city}, {selectedProperty.country}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#F59E0B]">{selectedProperty.price}π</span>
                  <span className="text-xs bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-1 rounded">
                    {selectedProperty.type.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    <Bed className="w-3 h-3 inline mr-1" />
                    {selectedProperty.bedrooms} {language === 'ar' ? 'غرف' : 'Beds'}
                  </div>
                  <div>
                    <Maximize2 className="w-3 h-3 inline mr-1" />
                    {selectedProperty.area} sqm
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailPanel(true);
                  }}
                  className="flex-1 py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {language === 'ar' ? 'التفاصيل' : 'View Details'}
                </button>
                <button
                  onClick={() => {
                    setSelectedProperty(null);
                    setShowPanoramicTour(true);
                  }}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#F59E0B] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Video className="w-4 h-4" />
                  {language === 'ar' ? 'جولة ذكية' : 'AI Tour'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VR Tour Viewer */}
        {showPanoramicTour && selectedProperty && (
          <VRPropertyTourViewer
            property={DEMO_PROPERTY}
            onClose={() => {
              setShowPanoramicTour(false);
              setSelectedProperty(null);
            }}
            onBuyClick={() => {
              alert('Buy with Pi feature - Integrate with Pi payment SDK');
            }}
          />
        )}

        {/* Map Div - Hidden when detail panel is open */}
        <div
          ref={mapContainerRef}
          className="w-full bg-gray-950 flex-1 transition-all duration-300 ease-in-out"
          style={{
            height: showDetailPanel ? '0' : 'calc(100vh - 160px)',
            opacity: showDetailPanel ? 0 : 1,
            transition: 'height 0.3s ease, opacity 0.3s ease',
            pointerEvents: showDetailPanel ? 'none' : 'auto',
          }}
        />

        {/* Property Detail Panel - Slides in from right */}
        {selectedProperty && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-300 ease-in-out"
            style={{
              opacity: showDetailPanel ? 1 : 0,
              pointerEvents: showDetailPanel ? 'auto' : 'none',
            }}
            onClick={() => setShowDetailPanel(false)}
          >
            <div
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-lg border-l border-accent/20 overflow-y-auto transition-transform duration-300 ease-in-out"
              style={{
                transform: showDetailPanel ? 'translateX(0)' : 'translateX(100%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-black/50 border-b border-accent/10">
                <h2 className="font-bold text-lg">{language === 'ar' ? 'تفاصيل العقار' : 'Property Details'}</h2>
                <button
            onClick={() => {
              try {
                setShowDetailPanel(false);
              } catch (error) {
                console.error('Panel close error:', error);
                toast.error('Could not close panel. Please try again.');
              }
            }}
                  className="p-2 hover:bg-accent/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Property Content */}
              <div className="p-4 space-y-6">
                {/* Header Info */}
                <div>
                  <h3 className="text-xl font-bold text-balance mb-2">
                    {language === 'ar' ? selectedProperty.titleAr : selectedProperty.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="capitalize bg-accent/20 text-accent px-3 py-1 rounded-lg text-xs font-semibold">
                      {selectedProperty.type === 'buy' && (language === 'ar' ? 'شراء' : 'Buy')}
                      {selectedProperty.type === 'rent' && (language === 'ar' ? 'إيجار' : 'Rent')}
                      {selectedProperty.type === 'hotel' && (language === 'ar' ? 'فندق' : 'Hotel')}
                      {selectedProperty.type === 'invest' && (language === 'ar' ? 'استثمار' : 'Invest')}
                    </span>
                    <span className="text-sm text-gray-400">
                      {language === 'ar' ? `قائمة منذ ${selectedProperty.daysListed} يوم` : `Listed ${selectedProperty.daysListed} days ago`}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-400">{language === 'ar' ? 'الموقع' : 'Location'}</div>
                      <div className="font-semibold">{selectedProperty.city}, {selectedProperty.country}</div>
                      <div className="text-xs text-gray-500">{selectedProperty.countryFlag}</div>
                    </div>
                  </div>
                </div>

                {/* Price & ROI */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-3 border border-accent/20">
                    <div className="text-xs text-gray-400 mb-1">{language === 'ar' ? 'السعر' : 'Price'}</div>
                    <div className="text-2xl font-bold text-accent">{selectedProperty.price}π</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg p-3 border border-green-500/20">
                    <div className="text-xs text-gray-400 mb-1">{language === 'ar' ? 'ROI المتوقع' : 'Exp. ROI'}</div>
                    <div className="text-2xl font-bold text-green-400">{selectedProperty.roiScore}%</div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-800">
                    <Bed className="w-4 h-4 text-accent mx-auto mb-1" />
                    <div className="text-sm font-semibold">{selectedProperty.bedrooms}</div>
                    <div className="text-xs text-gray-500">{language === 'ar' ? 'غرف نوم' : 'Bedrooms'}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-800">
                    <Maximize2 className="w-4 h-4 text-accent mx-auto mb-1" />
                    <div className="text-sm font-semibold">{selectedProperty.area}m²</div>
                    <div className="text-xs text-gray-500">{language === 'ar' ? 'المساحة' : 'Area'}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-800">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1" style={{ color: selectedProperty.marketTrend === 'up' ? '#10b981' : selectedProperty.marketTrend === 'down' ? '#ef4444' : '#6b7280' }} />
                    <div className="text-sm font-semibold capitalize">{selectedProperty.marketTrend}</div>
                    <div className="text-xs text-gray-500">{language === 'ar' ? 'الاتجاه' : 'Trend'}</div>
                  </div>
                </div>

                {/* Market Stats */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <h4 className="font-semibold mb-3">{language === 'ar' ? 'إحصائيات السوق' : 'Market Stats'}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{language === 'ar' ? 'التقدير المتوقع' : 'Appreciation'}</span>
                      <span className="font-semibold text-green-400">+{selectedProperty.appreciation}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{language === 'ar' ? 'درجة الاستثمار' : 'ROI Score'}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-accent h-2 rounded-full"
                            style={{ width: `${(selectedProperty.roiScore || 0) / 100 * 100}%` }}
                          />
                        </div>
                        <span className="font-semibold text-accent">{selectedProperty.roiScore}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      {language === 'ar' ? 'كود العقار' : 'Property Code'}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      #{selectedProperty.id}
                    </p>
                  </div>
                  <PropertyQRCode propertyId={selectedProperty.id} size={72} className="rounded" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pb-4">
                  <UnifiedPaymentButton
                    propertyId={String(selectedProperty.id)}
                    propertyTitle={language === 'ar' ? selectedProperty.titleAr : selectedProperty.title}
                    price={selectedProperty.price}
                    transactionType={selectedProperty.type === 'invest' ? 'invest' : selectedProperty.type === 'rent' ? 'rent' : selectedProperty.type === 'hotel' ? 'hotel' : 'buy'}
                    language={language}
                    currency="PI"
                    className="flex-1 bg-accent text-black font-semibold py-3 rounded-lg hover:bg-accent/90 transition flex items-center justify-center gap-2"
                  />
                  <button
                    onClick={() => setShowPanoramicTour(true)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    {language === 'ar' ? 'جولة 360' : '360° Tour'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Property Sheet - Below Map (for when detail panel is closed) */}
        {selectedProperty && !showDetailPanel && (
          <div className="bg-gradient-to-r from-black/90 to-black/80 backdrop-blur-lg border-t border-accent/20 p-4 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-full flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{language === 'ar' ? selectedProperty.titleAr : selectedProperty.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span className="capitalize bg-gray-800/50 px-2 py-1 rounded text-xs font-medium">
                    {selectedProperty.type === 'buy' && (language === 'ar' ? 'شراء' : 'Buy')}
                    {selectedProperty.type === 'rent' && (language === 'ar' ? 'إيجار' : 'Rent')}
                    {selectedProperty.type === 'hotel' && (language === 'ar' ? 'فندق' : 'Hotel')}
                    {selectedProperty.type === 'invest' && (language === 'ar' ? 'استثمار' : 'Invest')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-accent" />
                    {selectedProperty.city}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-accent font-bold text-lg">{selectedProperty.price}π</div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="mt-2 p-1 hover:bg-accent/20 rounded transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
