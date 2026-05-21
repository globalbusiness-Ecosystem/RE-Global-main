'use client';

import { Menu, Circle, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  language: 'en' | 'ar';
  onSettingsClick?: () => void;
  onMenuItemClick?: (category: string) => void;
  currentPage?: string;
  onLogoTap?: () => void;
}

export default function Header({ language, onSettingsClick, onMenuItemClick, currentPage, onLogoTap }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { id: 'whitepaper', label: language === 'en' ? 'White Paper 📄' : 'الورقة البيضاء 📄' },
    { id: 'hotel', label: language === 'en' ? 'Hotel' : 'فندق' },
    { id: 'invest', label: language === 'en' ? 'Invest' : 'استثمر' },
    { id: 'tokenized', label: language === 'en' ? 'Tokenized' : 'معمّم' },
    { id: 'abroad', label: language === 'en' ? 'Abroad' : 'بالخارج' },
    { id: 'offplan', label: language === 'en' ? 'Off-Plan' : 'قيد الإنشاء' },
    { id: 'partners', label: language === 'en' ? 'Partners' : 'الشركاء' },
    { id: 'sell', label: language === 'en' ? 'Sell Property' : 'بيع العقار' },
    { id: 'help', label: language === 'en' ? 'Help' : 'مساعدة' },
  ];

  const handleMenuClick = (itemId: string) => {
    if (onMenuItemClick) {
      onMenuItemClick(itemId);
    }
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-black h-12 px-3 flex items-center justify-between gap-2">
        {/* Far Left: Hamburger menu */}
        <button
          className="p-1 hover:opacity-70 transition flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
        </button>

        {/* Left: Gold dot + GlobalBusiness */}
        <div className="flex items-center gap-1.5 flex-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgb(212, 175, 55)' }}></div>
          <span className="text-xs font-semibold tracking-widest" style={{ color: 'rgb(212, 175, 55)' }}>
            GLOBAL BUSINESS
          </span>
        </div>

        {/* Center: RE with underline */}
        <div 
          className="flex flex-col items-center gap-0.5 flex-shrink-0 cursor-pointer"
          onClick={onLogoTap}
        >
          <h1 className="text-lg font-bold text-white tracking-wider">RE</h1>
          <div className="h-0.5 w-10 bg-gradient-to-r from-accent to-yellow-500"></div>
        </div>

        {/* Right: Gear/Settings icon */}
        <button
          className="p-1 hover:opacity-70 transition flex-shrink-0"
          onClick={onSettingsClick}
          title={language === 'en' ? 'Settings' : 'الإعدادات'}
        >
          <Circle className="w-4 h-4" style={{ color: 'rgb(212, 175, 55)', strokeWidth: 1.5 }} />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-12 left-4 bg-gray-900 border border-gray-800 rounded shadow-xl p-3 min-w-48 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
            <span className="text-xs font-semibold tracking-widest text-gray-400">MENU</span>
            <button
              className="p-1 hover:opacity-70 transition"
              onClick={() => setMenuOpen(false)}
            >
              <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded transition text-sm flex items-center justify-between group relative ${
                    isActive
                      ? 'text-accent font-medium'
                      : 'text-gray-300 hover:text-accent'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <ChevronRight className={`w-4 h-4 transition-opacity ${
                    isActive ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-100'
                  }`} />
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r transition-all"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
