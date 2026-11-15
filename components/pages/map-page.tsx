'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useProperties } from '@/lib/useProperties';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Search, X, ArrowLeft,
  MapPin, SlidersHorizontal, Globe, Bed, Maximize2, TrendingUp,
  Video, LocateFixed, Loader2, Car, Footprints, Navigation
} from 'lucide-react';
import { NavigationPanel } from '@/components/navigation-panel';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { UnifiedPaymentButton } from '@/components/unified-payment-button';
import { PropertyQRCode } from '@/components/property-qr-code';
import { MAP_I18N, getMapPropertyTitle, getMapPropertyCity } from '@/lib/map-i18n';
import { PanoramaModal } from '@/components/panorama-modal';
import { FOCUS_KEY, parseFocus, type MapFocus } from '@/lib/map-focus';
import { CARD_I18N } from '@/lib/card-i18n';
import { usePiRate } from '@/lib/usePiRate';
import { useShowDemo } from '@/lib/use-demo-listings';
import { propertyPaymentAmount } from '@/lib/payment-rules';
import { clusterPoints, dedupeListings, clusterSize, CLUSTER_MAX_ZOOM } from '@/lib/map-cluster';
import { mu } from '@/lib/map-ui-i18n';

// Leaflet lazy imports with performance optimization
let L: any;
let mapInitialized = false;

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
  /** Added from the admin panel: always shown, whatever the price filter says. */
  isAdmin?: boolean;
  vrUrl?: string;
  currency?: string;
  payAmountPi?: number;
  status?: string;
  /** The admin's translations of the listing text, by language. */
  translations?: Record<string, { title?: string; location?: string; description?: string }>;
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
  { id: 21, lat: 24.7136, lng: 46.6753, title: 'Riyadh Corporate Plaza', titleAr: 'بلازا الرياض للشركات', price: 3800, city: 'Riyadh', country: 'Saudi Arabia', countryFlag: '🇸🇦', type: 'invest', bedrooms: 5, area: 550, appreciation: 14.6, roiScore: 88, marketTrend: 'up', daysListed: 5 },
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

// One colour per listing type, shared by the dots, the type chips and the cards.
const TYPE_COLOR: Record<string, string> = { buy: '#3b82f6', rent: '#a855f7', hotel: '#f59e0b', invest: '#10b981' };

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
  language: NavLanguage;
  onPropertySelect?: (propertyId: number | string) => void;
  /** Leaves the map (back to the home page). */
  onBack?: () => void;
}

export default function MapPage({ language = 'en', onPropertySelect, onBack }: MapPageProps) {
  const t = MAP_I18N[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const mapInitStarted = useRef(false);
  const userMarkerRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'rent' | 'hotel' | 'invest'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showPanoramicTour, setShowPanoramicTour] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const layerRef = useRef<any>(null);
  const renderRef = useRef<(() => void) | null>(null);

  const { properties: firebaseProps } = useProperties();
  const piRate = usePiRate();
  const showDemo = useShowDemo();
  const tc = CARD_I18N[language] ?? CARD_I18N.en;
  const [mapReady, setMapReady] = useState(false);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const focusMarkerRef = useRef<any>(null);

  // Sample listings (if the admin allows them) plus the real ones. Real listings carry no invented ROI or trend numbers.
  const allProperties = useMemo<Property[]>(() => dedupeListings<Property>([
    ...(showDemo === false ? [] : properties),
    ...firebaseProps.filter((p) => p.lat && p.lng).map((p) => ({
      ...p, titleAr: p.titleAr || p.title, city: p.location || '', country: p.country || '', countryFlag: '🏠',
      bedrooms: p.bedrooms || 0, area: p.area || 0, isAdmin: true,
    } as Property)),
  ]), [showDemo, firebaseProps]);

  const matchesSearchAndCountry = useCallback((p: Property) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.titleAr.includes(searchTerm.trim()) || p.city.toLowerCase().includes(q);
    return matchSearch && (selectedCountries.length === 0 || selectedCountries.includes(p.country));
  }, [searchTerm, selectedCountries]);

  const filteredProperties = useMemo(
    () => allProperties.filter((p) => (filterType === 'all' || p.type === filterType) && matchesSearchAndCountry(p)),
    [allProperties, filterType, matchesSearchAndCountry],
  );
  // How many listings each type would show with the current search and country choice (the numbers on the type chips).
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = { all: 0, buy: 0, rent: 0, hotel: 0, invest: 0 };
    for (const p of allProperties) if (matchesSearchAndCountry(p)) { c.all++; c[p.type] = (c[p.type] ?? 0) + 1; }
    return c;
  }, [allProperties, matchesSearchAndCountry]);
  const shownCountries = useMemo(() => new Set(filteredProperties.map((p) => p.country).filter(Boolean)).size, [filteredProperties]);
  const activeFilters = (filterType !== 'all' ? 1 : 0) + selectedCountries.length;

  // A listing card sent the visitor here: remember where, then fly to that exact spot once the map is ready.
  useEffect(() => {
    let raw: string | null = null;
    try { raw = sessionStorage.getItem(FOCUS_KEY); sessionStorage.removeItem(FOCUS_KEY); } catch { /* private mode */ }
    const f = parseFocus(raw);
    if (f) setFocus(f);
  }, []);
  useEffect(() => {
    if (!focus || !mapReady || !mapInstanceRef.current || !L) return;
    const map = mapInstanceRef.current;
    try {
      if (focusMarkerRef.current) map.removeLayer(focusMarkerRef.current);
      focusMarkerRef.current = L.circleMarker([focus.lat, focus.lng], { radius: 16, color: '#d4af37', weight: 3, fillColor: '#d4af37', fillOpacity: 0.25 }).addTo(map);
      map.flyTo([focus.lat, focus.lng], 17, { duration: 1.5 });
    } catch (e) {
      console.error('Focus error:', e);
    }
  }, [focus, mapReady]);
  const focusProp = useMemo(() => (focus ? filteredProperties.find((p) => String(p.id) === focus.id) ?? null : null), [focus, filteredProperties]);

  const countries = useMemo(() => Array.from(new Set(allProperties.map((p) => p.country).filter(Boolean))).sort(), [allProperties]);

  const initMapOnDemand = useCallback(async () => {
    if (!mapContainerRef.current || mapInstanceRef.current || mapInitStarted.current) return;
    mapInitStarted.current = true;
    try {
      await initializeMap();
      if (!L) return;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false, worldCopyJump: true, minZoom: 2 }).setView([25, 15], 3);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 2, crossOrigin: 'anonymous', className: 'map-tile' }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution('© OpenStreetMap').addTo(map);
      map.on('zoomend', () => renderRef.current?.());
      mapInstanceRef.current = map;
      setMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please refresh and try again.');
    }
  }, []);

  // Draws what is on screen: single listings as coloured dots, close ones as one numbered bubble that zooms in when tapped.
  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !L) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    const byId = new Map(filteredProperties.map((p) => [String(p.id), p]));
    const colorOf = (type: string) => TYPE_COLOR[type] ?? '#d4af37';
    const seenSpot = new Map<string, number>();
    for (const c of clusterPoints(filteredProperties.map((p) => ({ id: String(p.id), lat: p.lat, lng: p.lng, type: p.type })), map.getZoom())) {
      if (c.count === 1) {
        const property = byId.get(c.ids[0]);
        if (!property) continue;
        // Two listings on the very same spot are spread on a tiny ring so both can be tapped.
        const spot = `${c.lat.toFixed(5)}:${c.lng.toFixed(5)}`;
        const n = seenSpot.get(spot) ?? 0;
        seenSpot.set(spot, n + 1);
        const lat = n ? c.lat + Math.sin(n * 2.4) * 0.00018 : c.lat, lng = n ? c.lng + Math.cos(n * 2.4) * 0.00018 : c.lng;
        const icon = L.divIcon({ className: 'map-dot', iconSize: [22, 22], iconAnchor: [11, 11], html: `<div style="width:22px;height:22px;border-radius:50%;background:${colorOf(c.types && Object.keys(c.types)[0])};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>` });
        L.marker([lat, lng], { icon, keyboard: false }).on('click', () => { setSelectedProperty(property); setShowDetailPanel(false); onPropertySelect?.(property.id); }).addTo(layer);
      } else {
        const size = clusterSize(c.count);
        const icon = L.divIcon({ className: 'map-cluster', iconSize: [size, size], iconAnchor: [size / 2, size / 2], html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#f5d76e,#b8860b);border:3px solid rgba(255,255,255,.9);box-shadow:0 0 0 5px rgba(212,175,55,.28),0 3px 10px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;color:#111;font-weight:800;font-size:${size > 40 ? 16 : 14}px">${c.count}</div>` });
        L.marker([c.lat, c.lng], { icon, keyboard: false }).on('click', () => {
          const [[a, b], [d, e]] = c.bounds;
          if (Math.abs(d - a) + Math.abs(e - b) < 0.0005) map.flyTo([c.lat, c.lng], Math.max(map.getZoom() + 2, CLUSTER_MAX_ZOOM), { duration: 0.8 });
          else map.flyToBounds(c.bounds, { padding: [60, 60], maxZoom: CLUSTER_MAX_ZOOM - 1, duration: 0.8 });
        }).addTo(layer);
      }
    }
  }, [filteredProperties, onPropertySelect]);
  renderRef.current = renderMarkers;
  useEffect(() => { if (mapReady) renderMarkers(); }, [mapReady, renderMarkers]);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocateError(t.geoNotSupported);
      return;
    }
    setLocatingUser(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(coords);
        setLocatingUser(false);

        if (mapInstanceRef.current && L) {
          if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
          }
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(59,130,246,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          userMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: userIcon, zIndexOffset: 1000 })
            .addTo(mapInstanceRef.current)
            .bindPopup(t.yourLocation);
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 6, { duration: 1.5 });
        }
      },
      (error) => {
        setLocatingUser(false);
        setLocateError(t.locateError);
        console.error('[Geolocation] error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [language]);

  // Haversine distance in km between user location and a given point
  const distanceToProperty = useMemo(() => {
    if (!userLocation || !selectedProperty) return null;
    const R = 6371; // Earth radius in km
    const dLat = ((selectedProperty.lat - userLocation.lat) * Math.PI) / 180;
    const dLng = ((selectedProperty.lng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((selectedProperty.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [userLocation, selectedProperty]);

  // Auto-initialize map when component mounts
  useEffect(() => {
    initMapOnDemand();
  }, [initMapOnDemand]);

  const navigateToRegion = useCallback((region: 'asia' | 'europe' | 'americas' | 'africa' | 'middle-east') => {
    try {
      if (!mapInstanceRef.current) return;
      const regionBounds = {
        asia: [[5, 70], [55, 150]], europe: [[35, -10], [70, 40]], americas: [[-55, -170], [80, -50]], africa: [[-35, -20], [37, 55]], 'middle-east': [[12, 25], [42, 60]],
      };
      mapInstanceRef.current.flyToBounds(L.latLngBounds(regionBounds[region]), { padding: [30, 30], duration: 1 });
      setShowFilters(false);
    } catch (error) {
      console.error('Navigation to region error:', error);
    }
  }, []);

  const worldView = useCallback(() => {
    try { mapInstanceRef.current?.flyTo([25, 15], 3, { duration: 1.2 }); } catch (e) { console.error('World view error:', e); }
  }, []);

  const resetFilters = () => { setFilterType('all'); setSearchTerm(''); setSelectedCountries([]); };
  const priceLabel = (p: Property) => `${Number(p.price).toLocaleString('en-US')} ${p.currency || 'π'}`;

  const mapHidden = showDetailPanel || showPanoramicTour;
  const typeLabel = (type: string) => (type === 'all' ? mu('all', language) : type === 'buy' ? t.typeBuy : type === 'rent' ? t.typeRent : type === 'hotel' ? t.typeHotel : t.typeInvest);

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Property Marker Popup */}
        {selectedProperty && showDetailPanel === false && (
          <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-3">
            <div 
              className="pointer-events-auto relative w-full max-w-sm rounded-2xl border border-[#F59E0B]/30 bg-gradient-to-b from-[#1a1410]/95 to-[#0f0b08]/95 p-4 shadow-2xl backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProperty(null)}
                aria-label={mu('close', language)}
                className="absolute end-3 top-3 p-1 hover:bg-[#F59E0B]/10 rounded transition-colors"
              >
                <X className="w-5 h-5 text-[#F59E0B]" />
              </button>

              {/* Property Info */}
              <div className="mb-4 pe-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  {getMapPropertyTitle(selectedProperty, language)}
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  {getMapPropertyCity(selectedProperty, language)}, {selectedProperty.country}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#F59E0B]">{priceLabel(selectedProperty)}</span>
                  <span className="text-xs bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-1 rounded">
                    {selectedProperty.type.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    <Bed className="w-3 h-3 inline mr-1" />
                    {selectedProperty.bedrooms} {t.beds}
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
                  {t.viewDetails}
                </button>
                <button
                  onClick={() => {
                    setShowPanoramicTour(true);
                  }}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#F59E0B] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Video className="w-4 h-4" />
                  {t.aiTour}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Where a property card sent the visitor: its exact spot on the map */}
        {focus && !showDetailPanel && !showPanoramicTour && (
          <div className="fixed bottom-20 left-3 right-3 z-40 flex items-center gap-3 rounded-xl border border-accent/40 bg-black/85 p-3 backdrop-blur" role="status">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-accent">📍 {tc.here}</p>
              <p className="truncate text-sm font-semibold text-white">{focusProp ? getMapPropertyTitle(focusProp, language) : (focus.title ?? '')}</p>
              {focusProp && <p className="truncate text-xs text-gray-400">{getMapPropertyCity(focusProp, language)}</p>}
            </div>
            {focusProp && (
              <button type="button" onClick={() => { setSelectedProperty(focusProp); setShowDetailPanel(true); }} className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-black">{tc.details}</button>
            )}
            {focusProp?.vrUrl && (
              <button type="button" onClick={() => { setSelectedProperty(focusProp); setShowPanoramicTour(true); }} className="rounded-lg border border-accent px-3 py-2 text-xs font-semibold text-accent">{tc.tour}</button>
            )}
            <button
              type="button"
              aria-label={tc.close}
              onClick={() => {
                setFocus(null);
                try { if (focusMarkerRef.current && mapInstanceRef.current) mapInstanceRef.current.removeLayer(focusMarkerRef.current); } catch { /* already gone */ }
                focusMarkerRef.current = null;
              }}
              className="rounded-lg p-2 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* VR Tour Viewer: the property's own 360 photo when the admin added one */}
        {showPanoramicTour && selectedProperty?.vrUrl && (
          <PanoramaModal
            url={selectedProperty.vrUrl}
            title={getMapPropertyTitle(selectedProperty, language)}
            language={language}
            onClose={() => { setShowPanoramicTour(false); setSelectedProperty(null); }}
          />
        )}
        {showPanoramicTour && selectedProperty && !selectedProperty.vrUrl && (
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

        {/* Live Navigation */}
        {showNavigation && selectedProperty && (
          <NavigationPanel
            language={language}
            destination={{
              lat: selectedProperty.lat,
              lng: selectedProperty.lng,
              title: getMapPropertyTitle(selectedProperty, language),
            }}
            onClose={() => setShowNavigation(false)}
            L={L}
          />
        )}

        {/* The map fills the screen; its controls float on top of it. Hidden while a panel covers it (the map layers sit above fixed panels otherwise). */}
        <div className="relative isolate w-full" style={{ height: 'calc(100dvh - 128px)', minHeight: 420, visibility: mapHidden ? 'hidden' : 'visible' }}>
          <div ref={mapContainerRef} className="absolute inset-0 bg-gray-950" />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1100] space-y-2 p-2">
            <div className="pointer-events-auto flex items-center gap-2">
              {onBack && (
                <button type="button" onClick={onBack} aria-label={mu('back', language)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-black/80 text-white shadow-lg backdrop-blur hover:bg-black">
                  <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                </button>
              )}
              <div className="relative min-w-0 flex-1">
                <input
                  type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchPlaceholder} aria-label={mu('searchLabel', language)}
                  className="h-10 w-full rounded-full border border-white/10 bg-black/80 ps-9 pe-9 text-start text-sm text-white shadow-lg backdrop-blur placeholder:text-gray-500 focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm('')} aria-label={mu('close', language)} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-300 hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button type="button" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters} aria-label={mu('filters', language)}
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-lg backdrop-blur ${showFilters || activeFilters ? 'border-accent bg-accent text-black' : 'border-white/10 bg-black/80 text-white'}`}>
                <SlidersHorizontal className="h-5 w-5" />
                {activeFilters > 0 && <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{activeFilters}</span>}
              </button>
            </div>

            <div className="pointer-events-auto flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label={mu('filters', language)}>
              {(['all', 'buy', 'rent', 'hotel', 'invest'] as const).map((type) => {
                const on = filterType === type;
                return (
                  <button key={type} type="button" aria-pressed={on} onClick={() => setFilterType(type)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow backdrop-blur ${on ? 'border-accent bg-accent text-black' : 'border-white/10 bg-black/80 text-gray-100'}`}>
                    {type !== 'all' && <span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLOR[type] }} />}
                    {typeLabel(type)}
                    <span className={on ? 'text-black/70' : 'text-gray-400'}>{typeCounts[type] ?? 0}</span>
                  </button>
                );
              })}
            </div>

            <p className="pointer-events-none inline-block rounded-full bg-black/70 px-3 py-1 text-[11px] text-gray-200 backdrop-blur">
              {filteredProperties.length} {mu('properties', language)}{shownCountries > 0 ? ` · ${shownCountries} ${mu('countries', language)}` : ''}
            </p>
          </div>

          {showFilters && (
            <div className="absolute inset-x-2 top-[7.5rem] z-[1150] max-h-[60%] space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/90 p-4 pt-0 shadow-2xl backdrop-blur">
              <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-2 border-b border-white/10 bg-black/95 px-4 py-3">
                <p className="text-sm font-semibold text-white">{mu('filters', language)}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={resetFilters} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10">{mu('reset', language)}</button>
                  <button type="button" onClick={() => setShowFilters(false)} aria-label={mu('close', language)} className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-300">{mu('regions', language)}</p>
                <div className="flex flex-wrap gap-2">
                  {([['africa', 'africa'], ['asia', 'asia'], ['europe', 'europe'], ['americas', 'americas'], ['middle-east', 'middleEast']] as const).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => navigateToRegion(key)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-100 hover:bg-white/10">{mu(label, language)}</button>
                  ))}
                </div>
              </div>
              {countries.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-300">{mu('countriesTitle', language)}</p>
                  <div className="flex flex-wrap gap-2">
                    {countries.map((country) => {
                      const on = selectedCountries.includes(country);
                      return (
                        <button key={country} type="button" aria-pressed={on} onClick={() => setSelectedCountries((prev) => (on ? prev.filter((c) => c !== country) : [...prev, country]))}
                          className={`rounded-full border px-3 py-1.5 text-xs ${on ? 'border-accent bg-accent text-black' : 'border-white/10 bg-white/5 text-gray-100'}`}>{country}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-28 end-3 z-[1100] flex flex-col gap-2">
            <button type="button" onClick={worldView} aria-label={mu('worldView', language)} title={mu('worldView', language)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white shadow-lg backdrop-blur hover:bg-black">
              <Globe className="h-5 w-5" />
            </button>
            <button type="button" onClick={locateUser} disabled={locatingUser} aria-label={t.locateMe} title={t.locateMe}
              className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur ${userLocation ? 'border-accent bg-accent/20 text-accent' : 'border-white/10 bg-black/80 text-white'}`}>
              {locatingUser ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
            </button>
          </div>

          {filteredProperties.length === 0 && mapReady && (
            <div className="absolute inset-x-6 top-1/2 z-[1100] -translate-y-1/2 rounded-2xl border border-white/10 bg-black/85 p-4 text-center backdrop-blur">
              <p className="text-sm text-gray-200">{mu('noResults', language)}</p>
              {activeFilters > 0 || searchTerm ? <button type="button" onClick={resetFilters} className="mt-3 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-black">{mu('reset', language)}</button> : null}
            </div>
          )}
          {locateError && <p className="absolute inset-x-6 bottom-4 z-[1100] rounded-lg bg-red-900/80 p-2 text-center text-xs text-white" role="alert">{locateError}</p>}
        </div>

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
                <h2 className="font-bold text-lg">{t.propertyDetails}</h2>
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
                    {getMapPropertyTitle(selectedProperty, language)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="capitalize bg-accent/20 text-accent px-3 py-1 rounded-lg text-xs font-semibold">
                      {selectedProperty.type === 'buy' && t.typeBuy}
                      {selectedProperty.type === 'rent' && t.typeRent}
                      {selectedProperty.type === 'hotel' && t.typeHotel}
                      {selectedProperty.type === 'invest' && t.typeInvest}
                    </span>
                    <span className="text-sm text-gray-400">
                      {t.listedDaysAgo(selectedProperty.daysListed ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-400">{t.location}</div>
                      <div className="font-semibold">{getMapPropertyCity(selectedProperty, language)}, {selectedProperty.country}</div>
                      <div className="text-xs text-gray-500">{selectedProperty.countryFlag}</div>
                    </div>
                  </div>
                </div>

                {/* Price & ROI */}
                <div className={`grid gap-3 ${selectedProperty.roiScore !== undefined ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-3 border border-accent/20">
                    <div className="text-xs text-gray-400 mb-1">{t.price}</div>
                    <div className="text-2xl font-bold text-accent">{priceLabel(selectedProperty)}</div>
                  </div>
                  {selectedProperty.roiScore !== undefined && (
                    <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg p-3 border border-green-500/20">
                      <div className="text-xs text-gray-400 mb-1">{t.expRoi}</div>
                      <div className="text-2xl font-bold text-green-400">{selectedProperty.roiScore}%</div>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className={`grid gap-2 ${selectedProperty.marketTrend ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-800">
                    <Bed className="w-4 h-4 text-accent mx-auto mb-1" />
                    <div className="text-sm font-semibold">{selectedProperty.bedrooms}</div>
                    <div className="text-xs text-gray-500">{t.bedrooms}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-800">
                    <Maximize2 className="w-4 h-4 text-accent mx-auto mb-1" />
                    <div className="text-sm font-semibold">{selectedProperty.area}m²</div>
                    <div className="text-xs text-gray-500">{t.area}</div>
                  </div>
                  {selectedProperty.marketTrend && (
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-800">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1" style={{ color: selectedProperty.marketTrend === 'up' ? '#10b981' : selectedProperty.marketTrend === 'down' ? '#ef4444' : '#6b7280' }} />
                    <div className="text-sm font-semibold capitalize">{selectedProperty.marketTrend}</div>
                    <div className="text-xs text-gray-500">{t.trend}</div>
                  </div>
                  )}
                </div>

                {selectedProperty.roiScore !== undefined && selectedProperty.appreciation !== undefined && (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <h4 className="font-semibold mb-3">{t.marketStats}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{t.appreciation}</span>
                      <span className="font-semibold text-green-400">+{selectedProperty.appreciation}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{t.roiScore}</span>
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
                )}

                {/* Distance from user */}
                {userLocation && distanceToProperty !== null && (
                  <div className="bg-gray-900/50 rounded-lg p-3 mb-3 space-y-2">
                    <p className="text-xs text-gray-400">
                      {t.distanceFromYou}
                    </p>
                    <p className="text-lg font-bold text-blue-400">
                      {distanceToProperty < 1
                        ? `${Math.round(distanceToProperty * 1000)} m`
                        : `${distanceToProperty.toFixed(1)} km`}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-accent" />
                        ~
                        {Math.max(1, Math.round((distanceToProperty / 50) * 60))}{' '}
                        {t.minDrive}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5 text-accent" />
                        {distanceToProperty < 20
                          ? `${Math.max(1, Math.round((distanceToProperty / 5) * 60))} ${t.minWalk}`
                          : t.tooFarToWalk}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {t.estimatedStraightLine}
                    </p>
                  </div>
                )}
                {!userLocation && (
                  <button
                    onClick={locateUser}
                    disabled={locatingUser}
                    className="w-full flex items-center justify-center gap-2 text-xs text-accent border border-accent/40 rounded-lg py-2 mb-3 hover:bg-accent/10 transition"
                  >
                    {locatingUser ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5" />
                    )}
                    {t.locateYourselfDistance}
                  </button>
                )}
                {locateError && (
                  <p className="text-xs text-red-400 mb-3">{locateError}</p>
                )}

                <button
                  onClick={() => setShowNavigation(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg mb-3 transition"
                >
                  <Navigation className="w-4 h-4" />
                  {t.startLiveNav}
                </button>

                {/* QR Code */}
                <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      {t.propertyCode}
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
                    propertyTitle={getMapPropertyTitle(selectedProperty, language)}
                    price={selectedProperty.price}
                    amountPi={selectedProperty.isAdmin ? (propertyPaymentAmount(selectedProperty, piRate) ?? undefined) : undefined}
                    transactionType={selectedProperty.type === 'invest' ? 'invest' : selectedProperty.type === 'rent' ? 'rent' : selectedProperty.type === 'hotel' ? 'hotel' : 'buy'}
                    language={language}
                    currency="PI"
                    className="flex-1 bg-accent text-black font-semibold py-3 rounded-lg hover:bg-accent/90 transition flex items-center justify-center gap-2"
                  />
                  <button
                    onClick={() => {
                      setShowDetailPanel(false);
                      setShowPanoramicTour(true);
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    {t.tour360}
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
                <h3 className="font-bold text-base truncate">{getMapPropertyTitle(selectedProperty, language)}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span className="capitalize bg-gray-800/50 px-2 py-1 rounded text-xs font-medium">
                    {selectedProperty.type === 'buy' && t.typeBuy}
                    {selectedProperty.type === 'rent' && t.typeRent}
                    {selectedProperty.type === 'hotel' && t.typeHotel}
                    {selectedProperty.type === 'invest' && t.typeInvest}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-accent" />
                    {getMapPropertyCity(selectedProperty, language)}
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
