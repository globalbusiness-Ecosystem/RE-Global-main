'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  ChevronLeft,
  Check,
  Globe2,
  Moon,
  Bell,
  FileText,
  Phone,
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
  Camera,
  type LucideIcon,
} from 'lucide-react';
import { CurrencyPicker } from '@/components/currency-picker';
import { MyDataPanel } from '@/components/my-data-panel';
import { RewardsPanel } from '@/components/rewards-panel';
import { IconBadge, RowChevron } from '@/components/ui/icon-badge';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { UserAvatar } from '@/components/user-avatar';
import { AvatarPicker } from '@/components/avatar-picker';
import { useMyAvatar } from '@/hooks/use-my-avatar';
import { announceHandle, useIdentity } from '@/hooks/use-identity';
import { useCover } from '@/hooks/use-cover';
import { coverCss } from '@/lib/cover';
import { AVATAR_I18N } from '@/lib/avatar';
import { sl, type SettingsLabelKey } from '@/lib/settings-labels';
import { ProfileChecklist } from '@/components/profile-checklist';
import { profileSteps, type ProfileStepId } from '@/lib/profile-steps';
import { getStoredTheme, applyTheme } from '@/lib/theme';
import { LANGUAGE_OPTIONS, type NavLanguage } from '@/lib/nav-i18n';
import { SETTINGS_I18N } from '@/lib/settings-i18n';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { getOrCreateReferralCode, getReferralCount } from '@/lib/referrals';
import { authHeaders } from '@/lib/api-token';
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

const TAB_KEYS: Record<SettingsTab, SettingsLabelKey> = { profile: 'tabProfile', rewards: 'tabRewards', security: 'tabSecurity', notifications: 'tabNotifications' };

function tabLabel(tab: SettingsTab, language: NavLanguage) {
  return sl(TAB_KEYS[tab], language);
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
  const { name: shownName, isWebAccount, kycApproved } = useIdentity();
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
  // Web accounts (outside the Pi Browser) choose their own username once; it is also their invite code.
  const [handle, setHandle] = useState<string | null>(null);
  const [handleInput, setHandleInput] = useState('');
  const [handleMsg, setHandleMsg] = useState<'invalid' | 'taken' | 'already' | 'failed' | 'saved' | null>(null);
  const [handleBusy, setHandleBusy] = useState(false);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const { avatar, save: saveAvatar, remove: removeAvatar, signedIn: avatarSignedIn } = useMyAvatar();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { cover } = useCover();

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
    if (username.startsWith('web_')) {
      fetch('/api/handle', { headers: authHeaders(), cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { if (j && typeof j.handle === 'string') { setHandle(j.handle); if (typeof j.code === 'string') setReferralCode(j.code); } })
        .catch(() => {});
    }
  }, [username]);

  const saveHandle = async () => {
    setHandleMsg(null);
    setHandleBusy(true);
    try {
      const r = await fetch('/api/handle', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ handle: handleInput }) });
      const j = await r.json().catch(() => null);
      if (r.ok && j && typeof j.handle === 'string') { setHandle(j.handle); setReferralCode(String(j.code)); announceHandle(j.handle); setHandleMsg('saved'); }
      else setHandleMsg(j?.error === 'invalid' || j?.error === 'taken' || j?.error === 'already' ? j.error : 'failed');
    } catch { setHandleMsg('failed'); } finally { setHandleBusy(false); }
  };

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

  // Web accounts are verified by the identity check (KYC); Pi accounts by Pi, and fully once the e-mail is verified too.
  const level: 'none' | 'pi' | 'full' = isWebAccount ? (kycApproved ? 'full' : 'none') : !isPiVerified ? 'none' : profileVerified ? 'full' : 'pi';
  const securityScore = level === 'none' ? 30 : level === 'pi' ? 65 : 95;
  const securityLabel = sl(level === 'none' ? 'secBasic' : level === 'pi' ? 'secGood' : 'secExcellent', language);
  const securityColor = level === 'none' ? '#f59e0b' : level === 'pi' ? '#3b82f6' : '#22c55e';
  const statusLine = level === 'full' ? sl('fullyVerified', language) : level === 'pi' ? sl('connectedPi', language) : sl(isWebAccount ? 'unverified' : 'notConnected', language);

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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="relative h-28" style={{ background: coverCss(cover) }} aria-hidden>
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.35) 0, transparent 35%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0, transparent 40%)' }} />
        </div>
        <div className="px-5 pb-5">
        <div className="flex flex-col items-center text-center gap-3 -mt-14">
          <div className="relative rounded-full ring-4 ring-card shadow-xl">
            <button onClick={handleLogoTap} className="block rounded-full" aria-label={shownName ?? 'Profile'}>
              <UserAvatar avatar={avatar} username={shownName} size={88} />
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label={(AVATAR_I18N[language] ?? AVATAR_I18N.en).change}
              className="absolute -bottom-1 -end-1 w-8 h-8 rounded-full bg-accent text-accent-foreground border-2 border-card flex items-center justify-center"
            >
              <Camera className="w-4 h-4" aria-hidden />
            </button>
          </div>
          <div className="min-w-0 max-w-full">
            <p className="font-bold text-foreground text-lg truncate">
              {username ? (shownName ?? sl('guest', language)) : sl('guest', language)}
            </p>
            {isWebAccount && handle && handle !== shownName && (
              <p dir="ltr" className="text-xs text-muted-foreground">@{handle}</p>
            )}
            <p className="text-xs text-muted-foreground">{statusLine}</p>
          </div>
          <button type="button" onClick={() => setPickerOpen(true)} className="text-xs font-medium text-accent border border-accent/40 rounded-full px-3 py-1 hover:bg-accent/10 transition">
            {(AVATAR_I18N[language] ?? AVATAR_I18N.en).change}
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${securityColor}20` }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: securityColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              {sl('securityLevel', language)}
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
        </div>
      </div>

      {pickerOpen && (
        <AvatarPicker
          language={language}
          username={shownName}
          avatar={avatar}
          signedIn={avatarSignedIn}
          onSave={saveAvatar}
          onRemove={removeAvatar}
          onClose={() => setPickerOpen(false)}
        />
      )}

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
          <ProfileChecklist
            language={language}
            steps={profileSteps({ hasPicture: Boolean(avatar), piVerified: isWebAccount ? kycApproved : isPiVerified, emailVerified: profileVerified, invitedSomeone: referralCount > 0 })}
            onStep={(id: ProfileStepId) => {
              if (id === 'picture') setPickerOpen(true);
              else if (id === 'email') setActiveTab('security');
              else if (id === 'invite') handleCopyReferral();
            }}
          />

          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel icon={Users}>
              {sl('referralCode', language)}
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
                {copied ? sl('copied', language) : sl('copy', language)}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {sl('referralCount', language, referralCount)}
            </p>
            {isWebAccount && !handle && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-sm font-medium text-foreground">{sl('handleTitle', language)}</p>
                <p className="text-xs text-muted-foreground mt-1">{sl('handleHint', language)}</p>
                <input
                  dir="ltr"
                  aria-label={sl('handleTitle', language)}
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  maxLength={12}
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder={sl('handlePlaceholder', language)}
                  className="mt-2 w-full rounded-lg bg-muted px-3 py-2.5 font-mono text-sm text-foreground outline-none"
                />
                <button onClick={saveHandle} disabled={handleBusy || handleInput.trim().length < 4} className="mt-2 w-full rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50">
                  {sl('handleSave', language)}
                </button>
              </div>
            )}
            {handleMsg && (
              <p role="status" className={`mt-2 text-xs ${handleMsg === 'saved' ? 'text-emerald-500' : 'text-red-400'}`}>
                {sl(handleMsg === 'saved' ? 'handleSaved' : handleMsg === 'taken' || handleMsg === 'already' ? 'handleTaken' : handleMsg === 'invalid' ? 'handleInvalid' : 'handleFailed', language)}
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-muted-foreground">
                  {sl('username', language)}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {username && (handle || !isWebAccount) ? <bdi dir="ltr">@{handle ?? username}</bdi> : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-muted-foreground">
                  {sl('verification', language)}
                </span>
                <span className={`text-sm font-medium ${level === 'none' ? 'text-muted-foreground' : level === 'full' ? 'text-emerald-500' : 'text-blue-400'}`}>
                  {level === 'none' ? sl('unverified', language) : level === 'full' ? sl('fullyVerified', language) : sl('verifiedPi', language)}
                </span>
              </div>
              <button
                onClick={() => onNavigate?.('partners')}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/5 transition"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <IconBadge icon={Users} size="sm" />
                  {sl('community', language)}
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

          <CurrencyPicker />

          <div className="bg-card border border-border rounded-lg">
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
              {sl('dataPrivacy', language)}
            </SectionLabel>
            <div className="space-y-2">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 text-sm text-foreground hover:text-accent transition"
              >
                <span className="flex items-center gap-3"><IconBadge icon={Lock} size="sm" />{sl('privacyPolicy', language)}</span>
                <RowChevron />
              </a>
              <a
                href={`mailto:globalbusiness435@gmail.com?subject=${encodeURIComponent(
                  sl('reqDataSubject', language)
                )}&body=${encodeURIComponent(
                  `${sl('usernameLabel', language)} ${username || sl('notSignedIn', language)}`
                )}`}
                className="flex items-center justify-between py-2 text-sm text-foreground hover:text-accent transition"
              >
                <span className="flex items-center gap-3"><IconBadge icon={Download} size="sm" />{sl('reqDataRow', language)}</span>
                <RowChevron />
              </a>
              <a
                href={`mailto:globalbusiness435@gmail.com?subject=${encodeURIComponent(
                  sl('reqDeleteSubject', language)
                )}&body=${encodeURIComponent(
                  `${sl('usernameLabel', language)} ${username || sl('notSignedIn', language)}`
                )}`}
                className="flex items-center justify-between py-2 text-sm text-red-400 hover:text-red-300 transition"
              >
                <span className="flex items-center gap-3"><IconBadge icon={Trash2} tone="red" size="sm" />{sl('reqDeleteRow', language)}</span>
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
              {sl('accountStatus', language)}
            </SectionLabel>
            <div className="space-y-2 text-sm">
              {isWebAccount ? (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">
                  {sl('verification', language)}
                </span>
                <span className={kycApproved ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                  {kycApproved
                    ? sl('fullyVerified', language)
                    : sl('unverified', language)}
                </span>
              </div>
              ) : (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">
                  {sl('piVerification', language)}
                </span>
                <span className={isPiVerified ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                  {isPiVerified
                    ? sl('active', language)
                    : sl('notConnected', language)}
                </span>
              </div>
              )}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">
                  {sl('emailVerification', language)}
                </span>
                <span className={profileVerified ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                  {profileVerified
                    ? sl('verified', language)
                    : sl('notVerified', language)}
                </span>
              </div>
            </div>
            {!isWebAccount && isPiVerified && !profileVerified && (
              <button
                onClick={() => onNavigate?.('profile')}
                className="w-full mt-3 text-xs font-medium text-accent hover:opacity-80 transition text-left rtl:text-right"
              >
                {sl('verifyEmailHint', language)}
              </button>
            )}
          </div>

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
                    {sl('priceAlerts', language)}
                  </p>
                </div>
                <ToggleSwitch label={sl('priceAlerts', language)} checked={priceAlerts} onClick={handlePriceAlertsToggle} small />
              </div>
              <div className="flex items-center justify-between px-4 py-3 ps-11">
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm text-foreground">
                    {sl('newListings', language)}
                  </p>
                </div>
                <ToggleSwitch label={sl('newListings', language)} checked={newListings} onClick={handleNewListingsToggle} small />
              </div>
              <div className="flex items-center justify-between px-4 py-3 ps-11">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm text-foreground">
                    {sl('contractUpdates', language)}
                  </p>
                </div>
                <ToggleSwitch label={sl('contractUpdates', language)} checked={contractUpdates} onClick={handleContractUpdatesToggle} small />
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
