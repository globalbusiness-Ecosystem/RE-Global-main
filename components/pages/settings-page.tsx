'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  Check,
  Globe2,
  Moon,
  Bell,
  Coins,
  FileText,
  Phone,
  Mail,
  AtSign,
  Info,
  User,
  ShieldCheck,
  Copy,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStoredTheme, applyTheme } from '@/lib/theme';
import { LANGUAGE_OPTIONS, type NavLanguage } from '@/lib/nav-i18n';
import { SETTINGS_I18N } from '@/lib/settings-i18n';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { getOrCreateReferralCode, getReferralCount } from '@/lib/referrals';

interface SettingsPageProps {
  language: NavLanguage;
  setLanguage: (lang: NavLanguage) => void;
  onWhitePaperClick?: () => void;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

const NAV_LANG_KEY = 're_nav_language';

type SettingsTab = 'profile' | 'security' | 'notifications';

const TAB_LABELS: Record<SettingsTab, { en: string; ar: string }> = {
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  security: { en: 'Security', ar: 'الأمان' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
};

function tabLabel(tab: SettingsTab, language: NavLanguage) {
  return language === 'ar' ? TAB_LABELS[tab].ar : TAB_LABELS[tab].en;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 text-foreground font-semibold">
      {children}
    </div>
  );
}

export default function SettingsPage({
  language,
  setLanguage,
  onWhitePaperClick,
  onBack,
  onNavigate,
}: SettingsPageProps) {
  const t = SETTINGS_I18N[language];
  const { username, isAuthenticated } = usePiAuth();
  const [darkMode, setDarkMode] = useState(() => getStoredTheme() === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [navLanguage, setNavLanguage] = useState<NavLanguage>(language);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NAV_LANG_KEY) as NavLanguage | null;
      if (stored) setNavLanguage(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (!username) return;
    getOrCreateReferralCode(username).then(setReferralCode).catch(() => setReferralCode(null));
    getReferralCount(username).then(setReferralCount).catch(() => setReferralCount(0));
  }, [username]);

  const handleLanguagePick = (code: NavLanguage) => {
    setNavLanguage(code);
    try {
      localStorage.setItem(NAV_LANG_KEY, code);
    } catch {}
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
    if (pinCode === '202500') {
      setPinError('');
      alert(t.adminAccessGranted);
      setShowAdminPanel(false);
    } else {
      setPinError(t.invalidPin);
    }
  };

  const handleCopyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard?.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const securityScore = isAuthenticated ? 70 : 30;
  const securityLabel =
    securityScore >= 70
      ? (language === 'ar' ? 'جيد' : 'Good')
      : (language === 'ar' ? 'أساسي' : 'Basic');
  const securityColor = securityScore >= 70 ? '#22c55e' : '#f59e0b';

  return (
    <main className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto pb-24 space-y-4">
      <div className="flex items-center justify-between mb-2 -mx-4 px-4">
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
        <div className="w-6" />
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
        <button
          onClick={handleLogoTap}
          className="w-14 h-14 rounded-xl bg-accent/15 flex items-center justify-center shrink-0"
        >
          <User className="w-7 h-7 text-accent" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground text-lg truncate">
            {username ? `@${username}` : (language === 'ar' ? 'زائر' : 'Guest')}
          </p>
          <p className="text-xs text-muted-foreground">
            {isAuthenticated
              ? (language === 'ar' ? 'متصل عبر Pi Network' : 'Connected via Pi Network')
              : (language === 'ar' ? 'غير متصل' : 'Not connected')}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${securityColor}20` }}
        >
          <ShieldCheck className="w-5 h-5" style={{ color: securityColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            {language === 'ar' ? 'مستوى أمان الحساب: ' : 'Account security: '}
            <span className="font-semibold" style={{ color: securityColor }}>{securityLabel}</span>
          </p>
          <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${securityScore}%`, backgroundColor: securityColor }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {(['profile', 'security', 'notifications'] as SettingsTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tabLabel(tab, language)}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel>
              <Users className="w-4 h-4 text-accent" />
              {language === 'ar' ? 'كود الإحالة' : 'Referral Code'}
            </SectionLabel>
            <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5">
              <span className="font-mono text-sm text-foreground">
                {referralCode || '—'}
              </span>
              <button
                onClick={handleCopyReferral}
                className="flex items-center gap-1 text-xs text-accent font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ' : 'Copy')}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {language === 'ar'
                ? `عدد الأشخاص الذين استخدموا كودك: ${referralCount}`
                : `People who used your code: ${referralCount}`}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {username ? `@${username}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'حالة التحقق' : 'Verification'}
                </span>
                <span className={`text-sm font-medium ${isAuthenticated ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  {isAuthenticated
                    ? (language === 'ar' ? 'موثّق عبر Pi' : 'Verified via Pi')
                    : (language === 'ar' ? 'غير موثّق' : 'Unverified')}
                </span>
              </div>
              <button
                onClick={() => onNavigate?.('partners')}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/5 transition"
              >
                <span className="text-sm font-medium text-foreground">
                  {language === 'ar' ? 'المجتمع' : 'Community'}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel>
              <Globe2 className="w-4 h-4 text-accent" />
              {t.language}
            </SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => handleLanguagePick(opt.code)}
                  className={`flex items-center justify-between gap-2 py-2 px-3 rounded-lg font-medium transition ${
                    navLanguage === opt.code
                      ? 'bg-accent/10 border border-accent text-foreground'
                      : 'border border-border text-foreground hover:border-accent'
                  }`}
                >
                  <span>{opt.native}</span>
                  {navLanguage === opt.code && <Check className="w-4 h-4 text-accent" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel>
              <Coins className="w-4 h-4 text-accent" />
              {t.reToken}
            </SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">{t.tokenPrice}</p>
                <p className="text-base font-bold text-accent">1 $RE = 0.01π</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">{t.totalSupply}</p>
                <p className="text-base font-bold text-accent">100M $RE</p>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3 mb-4">
              <p className="text-xs text-muted-foreground mb-2">{t.howToEarn}</p>
              <ul className="text-xs text-foreground space-y-1">
                <li>• {t.buyProperties}</li>
                <li>• {t.investTokenizedAssets}</li>
                <li>• {t.referFriends}</li>
              </ul>
            </div>
            <button className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition">
              {t.buyRE}
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={onWhitePaperClick}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-accent" />
                <span className="font-semibold text-foreground text-sm">{t.whitePaper}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 pt-4">
              <SectionLabel>{t.contactUs}</SectionLabel>
            </div>
            <div className="divide-y divide-border">
              <a
                href="https://instagram.com/alshaibgroup.pi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/5 transition group"
              >
                <AtSign className="w-4 h-4 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{t.instagram}</p>
                  <p className="text-sm font-medium text-foreground">@alshaibgroup.pi</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel>
              <Info className="w-4 h-4 text-accent" />
              {t.aboutRePlatform}
            </SectionLabel>
            <div className="space-y-1.5 text-xs">
              <p className="text-accent font-medium">RE Platform v1.0.0</p>
              <p className="text-muted-foreground">{t.poweredByPiNetwork}</p>
              <p className="text-muted-foreground">© GlobalBusiness</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel>
              <ShieldCheck className="w-4 h-4 text-accent" />
              {language === 'ar' ? 'حالة الحساب' : 'Account Status'}
            </SectionLabel>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'التحقق عبر Pi Network' : 'Pi Network Verification'}
                </span>
                <span className={isAuthenticated ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                  {isAuthenticated
                    ? (language === 'ar' ? 'مفعّل' : 'Active')
                    : (language === 'ar' ? 'غير مفعّل' : 'Not connected')}
                </span>
              </div>
            </div>
          </div>

          {showAdminPanel && (
            <div className="bg-card border border-accent rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-accent">{t.adminPanel}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{t.enterPinFromSheets}</p>
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
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-accent shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t.darkMode}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t.luxuryDarkTheme}</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !darkMode;
                setDarkMode(next);
                applyTheme(next ? 'dark' : 'light');
              }}
              className={`w-12 h-7 rounded-full transition flex items-center shrink-0 ${
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

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-accent shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t.notifications}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t.propertyMarketAlerts}</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-7 rounded-full transition flex items-center shrink-0 ${
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
      )}
    </main>
  );
}
