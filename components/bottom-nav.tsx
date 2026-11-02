'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { Home, LayoutDashboard, AlertCircle, MapPin, User, Users } from 'lucide-react';
import { toast } from 'sonner';

interface BottomNavProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  language?: NavLanguage;
  alertCount?: number;
}

const navItems = [
  { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية', icon: Home },
  { id: 'dashboard', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'alerts', labelEn: 'Alerts', labelAr: 'التنبيهات', icon: AlertCircle },
  { id: 'map', labelEn: 'Map', labelAr: 'الخريطة', icon: MapPin },
  { id: 'profile', labelEn: 'Profile', labelAr: 'الملف الشخصي', icon: User },
  { id: 'partners', labelEn: 'Partners', labelAr: 'الشركاء', icon: Users },
];

export default function BottomNav({ currentPage, setCurrentPage, language = 'en', alertCount = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-1 py-2 flex justify-around items-center md:max-w-2xl lg:max-w-5xl md:mx-auto md:left-0 md:right-0 z-30">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        const label = language === 'ar' ? item.labelAr : item.labelEn;
        const badge = item.id === 'alerts' && alertCount > 0 ? alertCount : 0;
        return (
          <button
            key={item.id}
            onClick={() => {
              try {
                setCurrentPage(item.id);
              } catch (error) {
                console.error('Navigation error:', error);
                toast.error('Something went wrong, please try again');
              }
            }}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition duration-200 flex-1 ${
              isActive
                ? 'text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={label}
            aria-label={badge ? `${label} (${badge})` : undefined}
          >
            <span className="relative">
              <Icon className="w-5 h-5" />
              {badge > 0 && (
                <span aria-hidden="true" className="absolute -top-1.5 -end-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-4 text-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            <span className="text-xs font-medium leading-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
