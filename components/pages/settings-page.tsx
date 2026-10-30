'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  ChevronLeft,
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
  TrendingUp,
  Home,
  FileCheck2,
  Gift,
  Download,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { CurrencyPicker } from '@/components/currency-picker';
import { MyDataPanel } from '@/components/my-data-panel';
import { RewardsPanel } from '@/components/rewards-panel';
import { IconBadge, RowChevron } from '@/components/ui/icon-badge';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Button } from '@/components/ui/button';
import { getStoredTheme, applyTheme } from '@/lib/theme';
import { LANGUAGE_OPTIONS, type NavLanguage } from '@/lib/nav-i18n';
import { SETTINGS_I18N } from '@/lib/settings-i18n';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { getOrCreateReferralCode, getReferralCount } from '@/lib/referrals';
import { useFirebaseDatabase } from '@/lib/firebase-database';

interface SettingsPageProps {
  language: NavLanguage;
  setLanguage: (lang: NavLanguage) => void;
  onWhitePaperClick?: () => void;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

const NAV_LANG_KEY = 're_nav_language';
const NOTIF_KEY = 're_notifications_preference';
const PRICE_ALERTS_KEY = 're_notif_price_alerts';
const NEW_LISTINGS_KEY = 're_notif_new_listings';
const CONTRACT_UPDATES_KEY = 're_notif_contract_updates';

function readStoredBool(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) return stored === 'true';
  } catch {}
  return fallback;
}

type SettingsTab = 'profile' | 'rewards' | 'security' | 'notifications';

const TAB_ICONS: Record<SettingsTab, LucideIcon> = { profile: User, rewards: Gift, security: ShieldCheck, notifications: Bell };

const TAB_LABELS: Record<SettingsTab, { en: string; ar: string }> = {
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  rewards: { en: 'Rewards', ar: 'المكافآت' },
  security: { en: 'Security', ar: 'الأمان' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
};

function tabLabel(tab: SettingsTab, language: NavLanguage) {
  return language === 'ar' ? TAB_LABELS[tab].ar : TAB_LABELS[tab].en;
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 text-foreground font-semibold">
      {icon && <IconBadge icon={icon} />}
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
  const { username, isPiVerified } = usePiAuth();
  const { getPreferences, savePreferences, getProfile } = useFirebaseDatabase();
  const [profileVerified, setProfileVerified] = useState(false);
  const [darkMode, setDarkMode] = useState(() => getStoredTheme() === 'dark');
  const [notifications, setNotifications] = useState(() => readStoredBool(NOTIF_KEY, true));
  const [priceAlerts, setPriceAlerts] = useState(() => readStoredBool(PRICE_ALERTS_KEY, true));
  const [newListings, setNewListings] = useState(() => readStoredBool(NEW_LISTINGS_KEY, true));
  const [contractUpdates, setContractUpdates] = useState(() => readStoredBool(CONTRACT_UPDATES_KEY, true));
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
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

  useEffect(() => {
    if (!username) return;
    getPreferences(username)
      .then((prefs) => {
        if (!prefs) return;
        if (typeof prefs.notificationsEnabled === 'boolean') {
          setNotifications(prefs.notificationsEnabled);
          try { localStorage.setItem(NOTIF_KEY, String(prefs.notificationsEnabled)); } catch {}
        }
        if (typeof prefs.priceAlertsEnabled === 'boolean') {
          setPriceAlerts(prefs.priceAlertsEnabled);
          try { localStorage.setItem(PRICE_ALERTS_KEY, String(prefs.priceAlertsEnabled)); } catch {}
        }
        if (typeof prefs.newListingsEnabled === 'boolean') {
          setNewListings(prefs.newListingsEnabled);
          try { localStorage.setItem(NEW_LISTINGS_KEY, String(prefs.newListingsEnabled)); } catch {}
        }
        if (typeof prefs.contractUpdatesEnabled === 'boolean') {
          setContractUpdates(prefs.contractUpdatesEnabled);
          try { localStorage.setItem(CONTRACT_UPDATES_KEY, String(prefs.contractUpdatesEnabled)); } catch {}
        }
      })
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    if (!username) {
      setProfileVerified(false);
      return;
    }
    getProfile(username)
      .then((profile) => {
        setProfileVerified(Boolean(profile && profile.emailVerified));
      })
      .catch(() => setProfileVerified(false));
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

  const toggleNotificationPref = (
    field: 'notificationsEnabled' | 'priceAlertsEnabled' | 'newListingsEnabled' | 'contractUpdatesEnabled',
    localKey: string,
    current: boolean,
    setter: (v: boolean) => void
  ) => {
    const next = !current;
    setter(next);
    try {
      localStorage.setItem(localKey, String(next));
    } catch {}
    if (username) {
      savePreferences(username, { [field]: next }).catch(() => {});
    }
  };

  const handleNotificationsToggle = () =>
    toggleNotificationPref('notificationsEnabled', NOTIF_KEY, notifications, setNotifications);
  const handlePriceAlertsToggle = () =>
    toggleNotificationPref('priceAlertsEnabled', PRICE_ALERTS_KEY, priceAlerts, setPriceAlerts);
  const handleNewListingsToggle = () =>
    toggleNotificationPref('newListingsEnabled', NEW_LISTINGS_KEY, newListings, setNewListings);
  const handleContractUpdatesToggle = () =>
    toggleNotificationPref('contractUpdatesEnabled', CONTRACT_UPDATES_KEY, contractUpdates, setContractUpdates);

  const handleCopyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard?.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const securityScore = !isPiVerified ? 30 : profileVerified ? 95 : 65;
  const securityLabel = !isPiVerified
    ? (language === 'ar' ? 'أساسي' : 'Basic')
    : profileVerified
      ? (language === 'ar' ? 'ممتاز' : 'Excellent')
      : (language === 'ar' ? 'جيد' : 'Good');
  const securityColor = !isPiVerified ? '#f59e0b' : profileVerified ? '#22c55e' : '#3b82f6';

  return (
    <main className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto pb-24 space-y-4">
      <div className="flex items-center justify-between mb-2 -mx-4 px-4">
        <button
          onClick={onBack}
          className="p-1 hover:opacity-70 transition text-accent"
          title={t.backToHome}
        >
          <ChevronLeft className="w-6 h-6 rtl:rotate-180" aria-hidden />
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
            {isPiVerified
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

      <div role="tablist" className="flex gap-1 bg-muted rounded-lg p-1">
        {(['profile', 'rewards', 'security', 'notifications'] as SettingsTab[]).map((tab) => {
          const TabIcon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-md text-[11px] font-medium transition sm:flex-row sm:gap-1.5 sm:text-sm ${
                activeTab === tab
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TabIcon className="w-4 h-4 shrink-0" aria-hidden />
              <span className="truncate">{tabLabel(tab, language)}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel icon={Users}>
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
                <span
                  className={`text-sm font-medium ${
                    !isPiVerified
                      ? 'text-muted-foreground'
                      : profileVerified
                        ? 'text-emerald-500'
                        : 'text-blue-400'
                  }`}
                >
                  {!isPiVerified
                    ? (language === 'ar' ? 'غير موثّق' : 'Unverified')
                    : profileVerified
                      ? (language === 'ar' ? 'موثّق بالكامل' : 'Fully verified')
                      : (language === 'ar' ? 'موثّق عبر Pi' : 'Verified via Pi')}
                </span>
              </div>
              <button
                onClick={() => onNavigate?.('partners')}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/5 transition"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <IconBadge icon={Users} size="sm" />
                  {language === 'ar' ? 'المجتمع' : 'Community'}
                </span>
                <RowChevron />
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel icon={Globe2}>
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
            <SectionLabel icon={Coins}>
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
                <IconBadge icon={FileText} size="sm" />
                <span className="font-semibold text-foreground text-sm">{t.whitePaper}</span>
              </div>
              <RowChevron />
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 pt-4">
              <SectionLabel icon={Phone}>{t.contactUs}</SectionLabel>
            </div>
            <div className="divide-y divide-border">
              <a
                href="https://instagram.com/alshaibgroup.pi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/5 transition group"
              >
                <IconBadge icon={AtSign} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{t.instagram}</p>
                  <p className="text-sm font-medium text-foreground">@alshaibgroup.pi</p>
                </div>
                <RowChevron />
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel icon={ShieldCheck}>
              {language === 'ar' ? 'البيانات والخصوصية' : 'Data & Privacy'}
            </SectionLabel>
            <div className="space-y-2">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 text-sm text-foreground hover:text-accent transition"
              >
                <span className="flex items-center gap-3"><IconBadge icon={Lock} size="sm" />{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
                <RowChevron />
              </a>
              <a
                href={`mailto:globalbusiness435@gmail.com?subject=${encodeURIComponent(
                  language === 'ar' ? 'طلب بيانات الحساب' : 'Account Data Request'
                )}&body=${encodeURIComponent(
                  (language === 'ar'
                    ? 'اسم المستخدم: '
                    : 'Username: ') + (username || (language === 'ar' ? 'غير مسجل دخول' : 'not signed in'))
                )}`}
                className="flex items-center justify-between py-2 text-sm text-foreground hover:text-accent transition"
              >
                <span className="flex items-center gap-3"><IconBadge icon={Download} size="sm" />{language === 'ar' ? 'طلب نسخة من بياناتي' : 'Request a copy of my data'}</span>
                <RowChevron />
              </a>
              <a
                href={`mailto:globalbusiness435@gmail.com?subject=${encodeURIComponent(
                  language === 'ar' ? 'طلب حذف الحساب' : 'Account Deletion Request'
                )}&body=${encodeURIComponent(
                  (language === 'ar'
                    ? 'اسم المستخدم: '
                    : 'Username: ') + (username || (language === 'ar' ? 'غير مسجل دخول' : 'not signed in'))
                )}`}
                className="flex items-center justify-between py-2 text-sm text-red-400 hover:text-red-300 transition"
              >
                <span className="flex items-center gap-3"><IconBadge icon={Trash2} tone="red" size="sm" />{language === 'ar' ? 'طلب حذف الحساب' : 'Request account deletion'}</span>
                <RowChevron className="text-red-400" />
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel icon={Info}>
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

      {activeTab === 'rewards' && <RewardsPanel language={language} />}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel icon={ShieldCheck}>
              {language === 'ar' ? 'حالة الحساب' : 'Account Status'}
            </SectionLabel>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'التحقق عبر Pi Network' : 'Pi Network Verification'}
                </span>
                <span className={isPiVerified ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                  {isPiVerified
                    ? (language === 'ar' ? 'مفعّل' : 'Active')
                    : (language === 'ar' ? 'غير مفعّل' : 'Not connected')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'توثيق البريد الإلكتروني' : 'Email verification'}
                </span>
                <span className={profileVerified ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                  {profileVerified
                    ? (language === 'ar' ? 'موثّق' : 'Verified')
                    : (language === 'ar' ? 'غير موثّق' : 'Not verified')}
                </span>
              </div>
            </div>
            {isPiVerified && !profileVerified && (
              <button
                onClick={() => onNavigate?.('profile')}
                className="w-full mt-3 text-xs font-medium text-accent hover:opacity-80 transition text-left rtl:text-right"
              >
                {language === 'ar'
                  ? '+ وثّق بريدك الإلكتروني في الملف الشخصي لرفع مستوى الأمان'
                  : '+ Verify your email in your profile to raise your security level'}
              </button>
            )}
          </div>

          <CurrencyPicker />

          <MyDataPanel />

          {showAdminPanel && (
            <div className="bg-card border border-accent rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-accent">{t.adminPanel}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{t.enterPinFromSheets}</p>
              <a
                href="/admin"
                className="block w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium hover:opacity-90 transition text-sm text-center"
              >
                {t.unlockAdmin}
              </a>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <IconBadge icon={Moon} size="sm" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t.darkMode}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t.luxuryDarkTheme}</p>
              </div>
            </div>
            <ToggleSwitch
              label={t.darkMode}
              checked={darkMode}
              onClick={() => {
                const next = !darkMode;
                setDarkMode(next);
                applyTheme(next ? 'dark' : 'light');
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <IconBadge icon={Bell} size="sm" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t.notifications}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t.propertyMarketAlerts}</p>
              </div>
            </div>
            <ToggleSwitch label={t.notifications} checked={notifications} onClick={handleNotificationsToggle} />
          </div>

          {notifications && (
            <>
              <div className="flex items-center justify-between px-4 py-3 ps-11">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm text-foreground">
                    {language === 'ar' ? 'تنبيهات الأسعار' : 'Price alerts'}
                  </p>
                </div>
                <ToggleSwitch label={language === 'ar' ? 'تنبيهات الأسعار' : 'Price alerts'} checked={priceAlerts} onClick={handlePriceAlertsToggle} small />
              </div>
              <div className="flex items-center justify-between px-4 py-3 ps-11">
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm text-foreground">
                    {language === 'ar' ? 'عقارات جديدة' : 'New listings'}
                  </p>
                </div>
                <ToggleSwitch label={language === 'ar' ? 'عقارات جديدة' : 'New listings'} checked={newListings} onClick={handleNewListingsToggle} small />
              </div>
              <div className="flex items-center justify-between px-4 py-3 ps-11">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm text-foreground">
                    {language === 'ar' ? 'تحديثات العقود' : 'Contract updates'}
                  </p>
                </div>
                <ToggleSwitch label={language === 'ar' ? 'تحديثات العقود' : 'Contract updates'} checked={contractUpdates} onClick={handleContractUpdatesToggle} small />
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
