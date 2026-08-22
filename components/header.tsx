'use client';

import { Menu, Circle, X, ChevronRight, User, ScrollText, Star, LayoutDashboard, Settings as SettingsIcon, Moon, Sun, Globe2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { getStoredTheme, applyTheme } from '@/lib/theme';
import { LANGUAGE_OPTIONS, NAV_DICTIONARY, type NavLanguage } from '@/lib/nav-i18n';

interface HeaderProps {
  language: 'en' | 'ar';
  onSettingsClick?: () => void;
  onMenuItemClick?: (category: string) => void;
  currentPage?: string;
  onLogoTap?: () => void;
}

const NAV_LANG_KEY = 're_nav_language';

export default function Header({ language, onSettingsClick, onMenuItemClick, currentPage, onLogoTap }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [navLang, setNavLang] = useState<NavLanguage>(language);
  const { username, isAuthenticated } = usePiAuth();

  useEffect(() => {
    setDarkMode(getStoredTheme() === 'dark');
    try {
      const stored = localStorage.getItem(NAV_LANG_KEY) as NavLanguage | null;
      if (stored) setNavLang(stored);
    } catch {}
  }, []);

  const t = NAV_DICTIONARY[navLang];
  const isRtl = navLang === 'ar' || navLang === 'ur';

  const menuGroups: { titleKey: keyof typeof t; items: { id: string; labelKey: keyof typeof t }[] }[] = [
    {
      titleKey: 'dashboard',
      items: [
        { id: 'dashboard', labelKey: 'dashboard' },
        { id: 'contracts', labelKey: 'contracts' },
        { id: 'favorites', labelKey: 'favorites' },
      ],
    },
    {
      titleKey: 'invest',
      items: [
        { id: 'hotel', labelKey: 'hotel' },
        { id: 'invest', labelKey: 'invest' },
        { id: 'tokenized', labelKey: 'tokenized' },
        { id: 'abroad', labelKey: 'abroad' },
        { id: 'offplan', labelKey: 'offplan' },
      ],
    },
    {
      titleKey: 'help',
      items: [
        { id: 'partners', labelKey: 'partners' },
        { id: 'sell', labelKey: 'sell' },
        { id: 'whitepaper', labelKey: 'whitepaper' },
        { id: 'help', labelKey: 'help' },
        { id: 'settings', labelKey: 'settings' },
      ],
    },
  ];

  const icons: Record<string, any> = {
    dashboard: LayoutDashboard,
    contracts: ScrollText,
    favorites: Star,
    settings: SettingsIcon,
  };

  const handleMenuClick = (itemId: string) => {
    if (onMenuItemClick) onMenuItemClick(itemId);
    setMenuOpen(false);
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    applyTheme(next ? 'dark' : 'light');
  };

  const selectNavLang = (code: NavLanguage) => {
    setNavLang(code);
    setShowLangPicker(false);
    try {
      localStorage.setItem(NAV_LANG_KEY, code);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-black h-12 px-3 flex items-center justify-between gap-2">
        <button
          className="p-1 hover:opacity-70 transition flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-1.5 flex-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgb(212, 175, 55)' }}></div>
          <span className="text-xs font-semibold tracking-widest" style={{ color: 'rgb(212, 175, 55)' }}>
            GLOBAL BUSINESS
          </span>
        </div>

        <div
          className="flex flex-col items-center gap-0.5 flex-shrink-0 cursor-pointer"
          onClick={onLogoTap}
        >
          <h1 className="text-lg font-bold text-white tracking-wider">RE</h1>
          <div className="h-0.5 w-10 bg-gradient-to-r from-accent to-yellow-500"></div>
        </div>

        <button
          className="p-1 hover:opacity-70 transition flex-shrink-0"
          onClick={onSettingsClick}
          title={language === 'en' ? 'Settings' : 'الإعدادات'}
        >
          <Circle className="w-4 h-4" style={{ color: 'rgb(212, 175, 55)', strokeWidth: 1.5 }} />
        </button>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-gray-950 border-r border-gray-800 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left duration-300 flex flex-col"
          >
            <div className="p-4 border-b border-gray-800 bg-gradient-to-br from-accent/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-widest text-gray-400">{t.menu}</span>
                <button className="p-1 hover:opacity-70 transition" onClick={() => setMenuOpen(false)}>
                  <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500">
                    {isAuthenticated ? t.signedInAs : t.notSignedIn}
                  </p>
                  {username && <p className="text-sm text-white font-medium truncate">{username}</p>}
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-4">
              {menuGroups.map((group, gi) => (
                <div key={gi}>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = currentPage === item.id;
                      const Icon = icons[item.id];
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleMenuClick(item.id)}
                          className={`w-full text-left px-3 py-2.5 rounded transition text-sm flex items-center gap-2.5 group relative ${
                            isActive ? 'text-accent font-medium bg-accent/10' : 'text-gray-300 hover:text-accent hover:bg-white/5'
                          }`}
                        >
                          {Icon && <Icon className="w-4 h-4 shrink-0" />}
                          <span className="relative z-10 flex-1">{t[item.labelKey]}</span>
                          <ChevronRight className={`w-4 h-4 transition-opacity shrink-0 ${
                            isActive ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-100'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                  {gi < menuGroups.length - 1 && <div className="border-t border-gray-800 mt-3" />}
                </div>
              ))}
            </nav>

            <div className="p-3 border-t border-gray-800 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-400">{t.theme}</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-full px-1 py-1"
                >
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition ${!darkMode ? 'bg-accent text-black font-medium' : 'text-gray-400'}`}>
                    <Sun className="w-3 h-3" /> {t.lightMode}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition ${darkMode ? 'bg-accent text-black font-medium' : 'text-gray-400'}`}>
                    <Moon className="w-3 h-3" /> {t.darkMode}
                  </span>
                </button>
              </div>

              <div>
                <button
                  onClick={() => setShowLangPicker((v) => !v)}
                  className="w-full flex items-center justify-between px-1 py-1.5"
                >
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5" /> {t.displayLanguage}
                  </span>
                  <span className="text-xs text-accent">
                    {LANGUAGE_OPTIONS.find((l) => l.code === navLang)?.native}
                  </span>
                </button>
                {showLangPicker && (
                  <div className="mt-1.5 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.code}
                        onClick={() => selectNavLang(opt.code)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition"
                      >
                        <span className={navLang === opt.code ? 'text-accent' : 'text-gray-300'}>{opt.native}</span>
                        {navLang === opt.code && <Check className="w-3.5 h-3.5 text-accent" />}
                      </button>
                    ))}
                  </div>
                )}
                {navLang !== 'en' && navLang !== 'ar' && (
                  <p className="text-[10px] text-gray-500 mt-2 px-1 leading-relaxed">{t.translationNote}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
