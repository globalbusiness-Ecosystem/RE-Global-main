'use client';

import { Home, LayoutDashboard, AlertCircle, MapPin, User, Users } from 'lucide-react';
import { toast } from 'sonner';

interface BottomNavProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  language?: 'en' | 'ar';
}

const navItems = [
  { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية', icon: Home },
  { id: 'dashboard', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'alerts', labelEn: 'Alerts', labelAr: 'التنبيهات', icon: AlertCircle },
  { id: 'map', labelEn: 'Map', labelAr: 'الخريطة', icon: MapPin },
  { id: 'profile', labelEn: 'Profile', labelAr: 'الملف الشخصي', icon: User },
  { id: 'partners', labelEn: 'Partners', labelAr: 'الشركاء', icon: Users },
];

export default function BottomNav({ currentPage, setCurrentPage, language = 'en' }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-1 py-2 flex justify-around items-center md:max-w-md md:mx-auto md:left-0 md:right-0 z-30">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        const label = language === 'ar' ? item.labelAr : item.labelEn;
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
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium leading-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
