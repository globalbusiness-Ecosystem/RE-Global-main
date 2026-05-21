'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useProperties } from '@/lib/useProperties';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import HomePage from '@/components/pages/home-page';
import BuyPage from '@/components/pages/buy-page';
import RentPage from '@/components/pages/rent-page';
import FavoritesPage from '@/components/pages/favorites-page';
import DashboardPage from '@/components/pages/dashboard-page';
import AlertsPage from '@/components/pages/alerts-page';
import PaymentPage from '@/components/pages/payment-page';
import ProfilePage from '@/components/pages/profile-page';

// Lazy load category pages to reduce initial bundle size
const MapPage = dynamic(() => import('@/components/pages/map-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const SettingsPage = dynamic(() => import('@/components/pages/settings-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const HotelPage = dynamic(() => import('@/components/pages/hotel-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const InvestPage = dynamic(() => import('@/components/pages/invest-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const TokenizedPage = dynamic(() => import('@/components/pages/tokenized-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const AbroadPage = dynamic(() => import('@/components/pages/abroad-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const OffPlanPage = dynamic(() => import('@/components/pages/offplan-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const PartnersPage = dynamic(() => import('@/components/pages/partners-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const WhitePaperPage = dynamic(() => import('@/components/pages/whitepaper-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});
const AnalyticsPage = dynamic(() => import('@/components/pages/analytics-page'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-background" /> 
});

export default function App() {
  const { properties, loading: propertiesLoading } = useProperties();
  const [currentPage, setCurrentPage] = useState('home');
  const [previousPage, setPreviousPage] = useState('home');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [currency, setCurrency] = useState<'PI' | 'USD'>('PI');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminPin, setShowAdminPin] = useState(false);

  // Memoize featured properties
  const featuredProperties = useMemo(
    () => properties.filter(p => p.featured === true),
    [properties]
  );

  // Initialize dark mode once
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Listen for custom navigation events from property cards
  useEffect(() => {
    const handleNavigation = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        handlePageChange(customEvent.detail);
      } catch (error) {
        console.error('Navigation error:', error);
        toast.error('Something went wrong, please try again');
      }
    };
    
    window.addEventListener('navigateToPage', handleNavigation);
    return () => window.removeEventListener('navigateToPage', handleNavigation);
  }, []);

  const handlePageChange = (newPage: string) => {
    try {
      setPreviousPage(currentPage);
      setCurrentPage(newPage);
    } catch (error) {
      console.error('Page change error:', error);
      toast.error('Something went wrong, please try again');
    }
  };

  const goBack = () => {
    try {
      setCurrentPage('home');
    } catch (error) {
      console.error('Go back error:', error);
      toast.error('Something went wrong, please try again');
    }
  };

  const toggleFavorite = (propertyId: string) => {
    try {
      setFavorites((prev) =>
        prev.includes(propertyId)
          ? prev.filter((id) => id !== propertyId)
          : [...prev, propertyId]
      );
    } catch (error) {
      console.error('Toggle favorite error:', error);
      toast.error('Something went wrong, please try again');
    }
  };

  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);

    if (newTaps === 7) {
      setShowAdminPin(true);
      setLogoTaps(0);
    }
  };

  // Memoize category pages list to prevent unnecessary recalculations
  const categoryPages = useMemo(() => 
    ['hotel', 'invest', 'tokenized', 'abroad', 'offplan', 'partners', 'whitepaper', 'sell', 'help', 'analytics'],
    []
  );

  const showBackButton = categoryPages.includes(currentPage) || currentPage === 'whitepaper';

  // Memoize the rendered page to prevent unnecessary re-renders
  const renderedPage = useMemo(() => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            language={language}
            onCategoryClick={handlePageChange}
            properties={featuredProperties}
            propertiesLoading={propertiesLoading}
          />
        );
      case 'dashboard':
        return <DashboardPage language={language} onBack={() => handlePageChange('home')} />;
      case 'alerts':
        return <AlertsPage language={language} onBack={() => handlePageChange('home')} />;
      case 'map':
        return <MapPage language={language} />;
      case 'profile':
        return (
          <ProfilePage
            language={language}
            userId="user_123"
            onBack={() => handlePageChange('home')}
          />
        );
      case 'payment':
        return (
          <PaymentPage
            language={language}
            userId="user_123"
            onBack={() => handlePageChange('dashboard')}
          />
        );
      case 'buy':
        return (
          <BuyPage
            language={language}
            currency={currency}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        );
      case 'rent':
        return (
          <RentPage
            language={language}
            currency={currency}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        );
      case 'favorites':
        return (
          <FavoritesPage
            language={language}
            currency={currency}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        );
      case 'analytics':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <AnalyticsPage language={language} currency={currency} />
          </div>
        );
      case 'settings':
        return (
          <SettingsPage
            language={language}
            setLanguage={setLanguage}
            onWhitePaperClick={() => handlePageChange('whitepaper')}
            onBack={() => handlePageChange('home')}
          />
        );
      case 'whitepaper':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <WhitePaperPage
              language={language}
              onBack={goBack}
              showBackButton={true}
            />
          </div>
        );
      case 'hotel':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <HotelPage
              language={language}
              currency={currency}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onBack={goBack}
              showBackButton={showBackButton}
            />
          </div>
        );
      case 'invest':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <InvestPage
              language={language}
              currency={currency}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onBack={goBack}
              showBackButton={showBackButton}
            />
          </div>
        );
      case 'tokenized':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <TokenizedPage
              language={language}
              currency={currency}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onBack={goBack}
              showBackButton={showBackButton}
            />
          </div>
        );
      case 'abroad':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <AbroadPage
              language={language}
              currency={currency}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onBack={goBack}
              showBackButton={showBackButton}
            />
          </div>
        );
      case 'offplan':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <OffPlanPage
              language={language}
              currency={currency}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onBack={goBack}
              showBackButton={showBackButton}
            />
          </div>
        );
      case 'partners':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <PartnersPage language={language} onBack={goBack} showBackButton={showBackButton} />
          </div>
        );
      case 'sell':
        return (
          <div className="animate-in slide-in-from-right duration-300 px-4 py-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-800 rounded transition"
              >
                <span className="text-gray-400 text-lg">←</span>
              </button>
              <h1 className="text-3xl font-bold text-accent">
                {language === 'en' ? 'Sell Your Property' : 'بيع العقار'}
              </h1>
            </div>
            <p className="text-gray-300">
              {language === 'en' ? 'List your property on RE Platform' : 'ضع قائمة بعقارك على منصة RE'}
            </p>
          </div>
        );
      case 'help':
        return (
          <div className="animate-in slide-in-from-right duration-300 px-4 py-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-800 rounded transition"
              >
                <span className="text-gray-400 text-lg">←</span>
              </button>
              <h1 className="text-3xl font-bold text-accent">
                {language === 'en' ? 'Help & Support' : 'المساعدة والدعم'}
              </h1>
            </div>
            <p className="text-gray-300">
              {language === 'en' ? 'Get help with your account and properties' : 'احصل على المساعدة في حسابك والعقارات'}
            </p>
          </div>
        );
      default:
        return (
          <HomePage
            language={language}
            onCategoryClick={handlePageChange}
            properties={featuredProperties}
            propertiesLoading={propertiesLoading}
          />
        );
    }
  }, [currentPage, language, currency, favorites, featuredProperties, propertiesLoading]);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden dark">
      <Header 
        language={language} 
        onSettingsClick={() => handlePageChange('settings')}
        onMenuItemClick={handlePageChange}
        currentPage={currentPage}
        onLogoTap={handleLogoTap}
      />
      <div className="flex-1 overflow-y-auto pb-20">
        <Suspense fallback={<div className="w-full h-full bg-background" />}>
          {renderedPage}
        </Suspense>
      </div>
      <BottomNav currentPage={currentPage} setCurrentPage={handlePageChange} language={language} />

      {/* Admin PIN Modal */}
      {showAdminPin && (
        <AdminPinModal
          language={language}
          onClose={() => setShowAdminPin(false)}
        />
      )}
    </div>
  );
}

interface AdminPinModalProps {
  language: 'en' | 'ar';
  onClose: () => void;
}

function AdminPinModal({ language, onClose }: AdminPinModalProps) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePinSubmit = () => {
    if (pinInput === '202500') {
      setPinError('');
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setPinError(language === 'en' ? 'Invalid PIN' : 'رمز PIN غير صحيح');
      setPinInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePinSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-accent text-center">
          {language === 'en' ? 'Admin Access' : 'الوصول الإداري'}
        </h2>

        {!showSuccess ? (
          <>
            <p className="text-muted-foreground text-sm text-center">
              {language === 'en' ? 'Enter PIN code' : 'أدخل رمز PIN'}
            </p>

            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError('');
              }}
              onKeyPress={handleKeyPress}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-center text-2xl tracking-widest text-foreground focus:outline-none focus:border-accent"
              placeholder="••••••"
              autoFocus
            />

            {pinError && (
              <p className="text-sm text-red-500 text-center">{pinError}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onClose}
                className="border border-border text-foreground py-2 rounded-lg font-semibold hover:bg-background/50 transition"
              >
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                onClick={handlePinSubmit}
                className="bg-accent hover:bg-accent/90 text-accent-foreground py-2 rounded-lg font-semibold transition"
              >
                {language === 'en' ? 'Submit' : 'إرسال'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-3 py-4">
            <p className="text-green-500 text-lg font-semibold">
              {language === 'en' ? 'Access Granted' : 'تم منح الوصول'}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Welcome to Admin Panel' : 'مرحبا بك في لوحة التحكم'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}