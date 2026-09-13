'use client';

import { useState, useEffect } from 'react';
import { Lock, ExternalLink, Mail, MessageCircle, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStoredTheme, applyTheme } from '@/lib/theme';
import { LANGUAGE_OPTIONS, type NavLanguage } from '@/lib/nav-i18n';
import { SETTINGS_I18N } from '@/lib/settings-i18n';

interface SettingsPageProps {
  language: NavLanguage;
  setLanguage: (lang: NavLanguage) => void;
  onWhitePaperClick?: () => void;
  onBack?: () => void;
}

// Same key the header drawer already reads on load — writing here keeps
// them in sync without adding any new props between components.
const NAV_LANG_KEY = 're_nav_language';

export default function SettingsPage({
  language,
  setLanguage,
  onWhitePaperClick,
  onBack,
}: SettingsPageProps) {
  const t = SETTINGS_I18N[language];
  const [darkMode, setDarkMode] = useState(() => getStoredTheme() === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [navLanguage, setNavLanguage] = useState<NavLanguage>(language);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NAV_LANG_KEY) as NavLanguage | null;
      if (stored) setNavLanguage(stored);
    } catch {}
  }, []);

  const handleLanguagePick = (code: NavLanguage) => {
    setNavLanguage(code);
    try {
      localStorage.setItem(NAV_LANG_KEY, code);
    } catch {}
    // All 7 languages now have full page-content translations.
    setLanguage(code);
  };

  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);

    if (newTaps === 7) {
      setShowAdminPanel(true);
      setLogoTaps(0);
    }
  };

  const handlePinSubmit = () => {
    // Verify PIN (placeholder - in production would verify against Google Sheets)
    if (pinCode === '202500') {
      setPinError('');
      alert(t.adminAccessGranted);
      setShowAdminPanel(false);
    } else {
      setPinError(t.invalidPin);
    }
  };

  return (
    <main className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto pb-24 space-y-4">
      {/* Header with Back Arrow */}
      <div className="flex items-center justify-between mb-6 -mx-4 px-4">
        <button
          onClick={onBack}
          className="p-1 hover:opacity-70 transition text-accent"
          title={t.backToHome}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-accent flex-1 text-center">
          {t.settings}
        </h2>
        <button
          onClick={() => {}}
          className="p-1 hover:opacity-75 transition text-lg font-bold w-6"
        >
          {/* Placeholder for balance */}
        </button>
      </div>

      {/* 1. Language */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-3">
          {t.language}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => handleLanguagePick(opt.code)}
              className={`flex items-center justify-between gap-2 py-2 px-3 rounded-lg font-medium transition ${
                navLanguage === opt.code
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-border text-foreground hover:border-accent'
              }`}
            >
              <span>{opt.native}</span>
              {navLanguage === opt.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Dark Mode */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              {t.darkMode}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t.luxuryDarkTheme}
            </p>
          </div>
          <button
            onClick={() => {
              const next = !darkMode;
              setDarkMode(next);
              applyTheme(next ? 'dark' : 'light');
            }}
            className={`w-12 h-7 rounded-full transition flex items-center ${
              darkMode ? 'bg-accent' : 'bg-muted'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition transform ${
                darkMode ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Notifications */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              {t.notifications}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t.propertyMarketAlerts}
            </p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-7 rounded-full transition flex items-center ${
              notifications ? 'bg-accent' : 'bg-muted'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition transform ${
                notifications ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. RE Token */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4">
          {t.reToken}
        </h3>
        <div className="space-y-3 mb-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">
              {t.tokenPrice}
            </p>
            <p className="text-lg font-bold text-accent">1 $RE = 0.01π</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">
              {t.totalSupply}
            </p>
            <p className="text-lg font-bold text-accent">100M $RE</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">
              {t.howToEarn}
            </p>
            <ul className="text-xs text-foreground space-y-1">
              <li>• {t.buyProperties}</li>
              <li>• {t.investTokenizedAssets}</li>
              <li>• {t.referFriends}</li>
            </ul>
          </div>
        </div>
        <button className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition">
          {t.buyRE}
        </button>
      </div>

      {/* 5. White Paper */}
      <div className="bg-card border border-border rounded-lg p-4">
        <button
          onClick={onWhitePaperClick}
          className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition rounded-lg"
        >
          <h3 className="font-semibold text-foreground">
            {t.whitePaper}
          </h3>
          <ExternalLink className="w-5 h-5 text-accent" />
        </button>
      </div>

      {/* 6. Admin Panel */}
      {showAdminPanel && (
        <div className="bg-card border border-accent rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-accent">
              {t.adminPanel}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {t.enterPinFromSheets}
          </p>
          <input
            type="password"
            maxLength={6}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="••••••"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-center text-lg tracking-widest text-foreground placeholder-muted-foreground mb-3"
          />
          {pinError && <p className="text-xs text-red-500 mb-3">{pinError}</p>}
          <button
            onClick={handlePinSubmit}
            className="w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium hover:opacity-90 transition text-sm"
          >
            {t.unlockAdmin}
          </button>
        </div>
      )}

      {/* 7. Contact Us */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-3">
          {t.contactUs}
        </h3>
        <div className="space-y-3">
          <a
            href="mailto:globalbusiness435@gmail.com"
            className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-accent/50 hover:bg-accent/5 transition cursor-pointer group"
          >
            <Mail className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {t.email}
              </p>
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition">globalbusiness435@gmail.com</p>
            </div>
            <ExternalLink className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition" />
          </a>
          <a
            href="https://wa.me/201010810558"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textDecoration: 'none' }}
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-green-500 bg-green-500/10 hover:bg-green-500/20 hover:shadow-lg hover:shadow-green-500/20 transition cursor-pointer group w-full"
          >
            <MessageCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
            <div className="flex-1 text-left">
              <p className="text-xs text-muted-foreground">
                {t.whatsapp}
              </p>
              <p className="text-sm font-semibold text-green-500">+201010810558</p>
            </div>
            <MessageCircle className="w-5 h-5 text-green-500 opacity-70 group-hover:opacity-100 transition" />
          </a>
          <a
            href="https://instagram.com/alshaibgroup.pi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-accent/50 hover:bg-accent/5 transition cursor-pointer group"
          >
            <ExternalLink className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {t.instagram}
              </p>
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition">@alshaibgroup.pi</p>
            </div>
            <ExternalLink className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition" />
          </a>
        </div>
      </div>

      {/* 8. About */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-3">
          {t.aboutRePlatform}
        </h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>RE Platform v1.0.0</p>
          <p>{t.poweredByPiNetwork}</p>
          <p>© GlobalBusiness</p>
        </div>
      </div>
    </main>
  );
}
