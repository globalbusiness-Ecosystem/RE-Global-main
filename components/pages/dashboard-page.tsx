'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Home,
  Eye,
  ChevronRight,
  Wallet,
  Heart,
  FileCheck2,
  MapPin,
  MapPinOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useFavorites } from '@/lib/favorites-manager';
import { useProperties } from '@/lib/useProperties';
import { getUserContracts, type UserContract } from '@/lib/contract';

interface DashboardPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
}

export default function DashboardPage({ language, onBack }: DashboardPageProps) {
  const { user, location, locationError, requestLocation } = usePiAuth();
  const { favorites, loading: favoritesLoading } = useFavorites(user?.uid);
  const { properties } = useProperties();
  const [contracts, setContracts] = useState<UserContract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);

  // Resolve full property details for each favorited property id
  const favoriteProperties = favorites
    .map((f) => properties.find((p) => p.id === f.propertyId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  useEffect(() => {
    if (!user?.uid) return;
    setContractsLoading(true);
    getUserContracts(user.uid)
      .then(setContracts)
      .finally(() => setContractsLoading(false));
  }, [user?.uid]);

  const portfolioValuePi = favoriteProperties.reduce((sum, p) => sum + (p.price || 0), 0);

  const stats = [
    {
      labelEn: 'Properties Viewed',
      labelAr: 'العقارات المعروضة',
      value: '—', // TODO: wire to a real view-tracking event (e.g. Firestore counter per user)
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
    },
    {
      labelEn: 'Favorites Saved',
      labelAr: 'المفضلات المحفوظة',
      value: String(favoriteProperties.length),
      icon: Home,
      color: 'from-accent to-amber-500',
    },
    {
      labelEn: 'Portfolio Value',
      labelAr: 'قيمة المحفظة',
      value: `${portfolioValuePi}π`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
  ];

  const quickActions = [
    { labelEn: 'Search Properties', labelAr: 'البحث عن عقارات', pageId: 'home' },
    { labelEn: 'View Favorites', labelAr: 'عرض المفضلات', pageId: 'favorites' },
    { labelEn: 'Check Alerts', labelAr: 'تحقق من التنبيهات', pageId: 'alerts' },
    { labelEn: 'Browse Map', labelAr: 'استعرض الخريطة', pageId: 'map' },
  ];

  const contractStatusStyle: Record<UserContract['status'], { en: string; ar: string; color: string }> = {
    pending_signature: { en: 'Pending Signature', ar: 'بانتظار التوقيع', color: 'text-amber-400 bg-amber-500/15' },
    in_escrow: { en: 'In Escrow', ar: 'في الضمان', color: 'text-sky-400 bg-sky-500/15' },
    active: { en: 'Active', ar: 'نشط', color: 'text-green-400 bg-green-500/15' },
    completed: { en: 'Completed', ar: 'مكتمل', color: 'text-gray-400 bg-gray-500/15' },
  };

  const handleQuickAction = (pageId: string) => {
    const event = new CustomEvent('navigateToPage', { detail: pageId });
    window.dispatchEvent(event);
  };

  return (
    <main className="w-full min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-accent">
            {language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user
              ? language === 'en'
                ? `Welcome back, ${user.username}!`
                : `أهلا بعودتك، ${user.username}!`
              : language === 'en'
              ? 'Welcome back!'
              : 'أهلا وسهلا بعودتك!'}
          </p>

          {/* Real location */}
          <button
            onClick={requestLocation}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition"
          >
            {location ? (
              <>
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>{location.label ?? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`}</span>
              </>
            ) : (
              <>
                <MapPinOff className="w-3.5 h-3.5" />
                <span>
                  {locationError
                    ? language === 'en'
                      ? 'Location unavailable — tap to retry'
                      : 'الموقع غير متاح — اضغط للمحاولة'
                    : language === 'en'
                    ? 'Tap to share your location'
                    : 'اضغط لمشاركة موقعك'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="bg-card border border-border p-4 hover:border-accent/50 transition"
              >
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg w-fit mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-accent mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? stat.labelEn : stat.labelAr}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Wallet */}
        <Card className="bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-3 rounded-lg">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {language === 'en' ? 'Wallet' : 'المحفظة'}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {user?.uid ? `${user.uid.slice(0, 6)}...${user.uid.slice(-4)}` : (language === 'en' ? 'Not connected' : 'غير متصل')}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleQuickAction('payment')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {language === 'en' ? 'Send' : 'إرسال'}
            </Button>
            <Button
              onClick={() => handleQuickAction('payment')}
              variant="outline"
              className="border-border hover:bg-card hover:border-accent/50"
            >
              {language === 'en' ? 'Receive' : 'استلام'}
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                onClick={() => handleQuickAction(action.pageId)}
                variant="outline"
                className="h-auto py-4 border-border hover:bg-card hover:border-accent/50 transition"
              >
                <span className="text-center text-sm font-medium">
                  {language === 'en' ? action.labelEn : action.labelAr}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Smart Contracts */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-accent" />
            {language === 'en' ? 'Smart Contracts' : 'العقود الذكية'}
          </h2>
          {contractsLoading ? (
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'No contracts yet' : 'لا توجد عقود بعد'}
            </p>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => {
                const s = contractStatusStyle[c.status];
                return (
                  <Card key={c.id} className="bg-card border border-border p-4 hover:border-accent/50 transition cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-mono truncate">{c.counterparty}</p>
                      <span className="text-accent font-bold text-sm">{c.valuePi}π</span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                      {language === 'en' ? s.en : s.ar}
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              {language === 'en' ? 'Favorites' : 'المفضلة'}
            </h2>
            <button
              onClick={() => handleQuickAction('favorites')}
              className="text-accent hover:text-accent/80 text-sm flex items-center gap-1"
            >
              {language === 'en' ? 'View All' : 'عرض الكل'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {favoritesLoading ? (
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
          ) : favoriteProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'No favorites yet' : 'لا توجد مفضلات بعد'}
            </p>
          ) : (
            <div className="space-y-3">
              {favoriteProperties.map((p) => (
                <Card key={p.id} className="bg-card border border-border p-4 hover:border-accent/50 transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        {language === 'en' ? p.title : p.titleAr ?? p.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'en' ? p.location : p.locationAr ?? p.location}
                      </p>
                    </div>
                    <div className="text-accent font-bold text-sm">{p.price}π</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Section */}
        <Card className="bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 p-6">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-6 h-6 text-accent" />
            <h3 className="font-semibold text-foreground">
              {language === 'en' ? 'Your Portfolio' : 'محفظتك'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'en'
              ? 'Track your real estate investments and earnings'
              : 'تابع استثماراتك العقارية وأرباحك'}
          </p>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {language === 'en' ? 'View Portfolio' : 'عرض المحفظة'}
          </Button>
        </Card>
      </div>
    </main>
  );
}
