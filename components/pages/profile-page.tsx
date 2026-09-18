'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, LogOut, Phone, Mail, MapPin, FileText, ScrollText, Loader2, CheckCircle2, ShieldCheck, Crosshair } from 'lucide-react';
import { toast } from 'sonner';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useFirebaseDatabase } from '@/lib/firebase-database';
import { PROFILE_I18N } from '@/lib/profile-i18n';

interface ProfilePageProps {
  language: NavLanguage;
  favorites?: string[];
  onBack?: () => void;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.24 2H21.5l-7.5 8.57L22.9 22h-6.9l-5.4-7.06L4.4 22H1.14l8.02-9.17L1.4 2h7.06l4.88 6.46L18.24 2zm-1.2 18h1.9L7.02 4H5l12.04 16z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const EMPTY_PROFILE = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  companyName: '',
  websiteUrl: '',
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
};

const DIAL_CODES = [
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
];
// Longest dial code first, so "+20" doesn't swallow "+201" style typos etc.
const DIAL_CODES_BY_LENGTH = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length);

function splitPhone(stored: string): { dialCode: string; local: string } {
  const trimmed = (stored || '').trim();
  const match = DIAL_CODES_BY_LENGTH.find((d) => trimmed.startsWith(d.code));
  if (match) {
    return { dialCode: match.code, local: trimmed.slice(match.code.length).trim() };
  }
  return { dialCode: '+20', local: trimmed };
}

export default function ProfilePage({ language = 'en', favorites = [], onBack }: ProfilePageProps) {
  const t = PROFILE_I18N[language];
  const isRTL = language === 'ar' || language === 'ur';
  const { username, location: deviceLocation, locationError, requestLocation } = usePiAuth();
  const { getProfile, saveProfile, getContractsForUser } = useFirebaseDatabase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [contractsCount, setContractsCount] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [otpStage, setOtpStage] = useState<'idle' | 'sent'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpNote, setOtpNote] = useState('');
  const [dialCode, setDialCode] = useState('+20');
  const [localPhone, setLocalPhone] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    Promise.all([getProfile(username), getContractsForUser(username)]).then(([p, contracts]) => {
      if (p) {
        setProfile({
          fullName: p.fullName || '',
          email: p.email || '',
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
          companyName: p.companyName || '',
          websiteUrl: p.websiteUrl || '',
          facebookUrl: p.facebookUrl || '',
          twitterUrl: p.twitterUrl || '',
          instagramUrl: p.instagramUrl || '',
        });
        setEmailVerified(Boolean(p.emailVerified));
        setVerifiedEmail(p.verifiedEmail || '');
        const { dialCode: dc, local } = splitPhone(p.phone || '');
        setDialCode(dc);
        setLocalPhone(local);
      }
      setContractsCount(contracts.length);
      setLoading(false);
    });
  }, [username]);

  const handleSaveProfile = async () => {
    if (!username) {
      toast.error(t.mustSignInFirst);
      return;
    }
    setSaving(true);
    try {
      const stillVerified = emailVerified && profile.email === verifiedEmail;
      const ok = await saveProfile(username, {
        ...profile,
        emailVerified: stillVerified,
        verifiedEmail: stillVerified ? verifiedEmail : '',
      } as any);
      if (ok) {
        setEmailVerified(stillVerified);
        if (!stillVerified) setVerifiedEmail('');
        toast.success(t.profileSaved);
      } else {
        toast.error(t.errorSaving);
      }
    } catch (error) {
      toast.error(t.errorSaving);
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    if (!username || !profile.email) return;
    setOtpSending(true);
    setOtpNote('');
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email: profile.email }),
      });
      const data = await res.json();
      if (data.ok) {
        setOtpStage('sent');
        toast.success(language === 'ar' ? 'تم إرسال كود التحقق لبريدك' : 'Verification code sent to your email');
      } else {
        setOtpNote(data.error || (language === 'ar' ? 'فشل إرسال الكود' : 'Failed to send code'));
      }
    } catch {
      setOtpNote(language === 'ar' ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!username || !otpCode) return;
    setOtpVerifying(true);
    setOtpNote('');
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code: otpCode }),
      });
      const data = await res.json();
      if (data.ok) {
        setEmailVerified(true);
        setVerifiedEmail(profile.email);
        setOtpStage('idle');
        setOtpCode('');
        toast.success(language === 'ar' ? 'تم توثيق بريدك الإلكتروني' : 'Email verified');
      } else {
        setOtpNote(data.error || (language === 'ar' ? 'كود غير صحيح' : 'Incorrect code'));
      }
    } catch {
      setOtpNote(language === 'ar' ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleDialCodeChange = (code: string) => {
    setDialCode(code);
    setProfile((prev) => ({ ...prev, phone: `${code} ${localPhone}`.trim() }));
  };

  const handleLocalPhoneChange = (value: string) => {
    setLocalPhone(value);
    setProfile((prev) => ({ ...prev, phone: `${dialCode} ${value}`.trim() }));
  };

  const handleUseCurrentLocation = () => {
    setLocating(true);
    requestLocation();
  };

  const locationFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!locating) return;
    if (deviceLocation?.label) {
      if (locationFallbackTimer.current) clearTimeout(locationFallbackTimer.current);
      setProfile((prev) => ({ ...prev, location: deviceLocation.label! }));
      setLocating(false);
      return;
    }
    if (locationError) {
      toast.error(locationError);
      setLocating(false);
      return;
    }
    if (deviceLocation && !locationFallbackTimer.current) {
      // Coordinates arrived but reverse-geocoding hasn't resolved yet —
      // fall back to raw coordinates if it takes too long.
      locationFallbackTimer.current = setTimeout(() => {
        setProfile((prev) => ({
          ...prev,
          location: `${deviceLocation.lat.toFixed(3)}, ${deviceLocation.lng.toFixed(3)}`,
        }));
        setLocating(false);
        locationFallbackTimer.current = null;
      }, 5000);
    }
    return () => {
      if (locationFallbackTimer.current) {
        clearTimeout(locationFallbackTimer.current);
        locationFallbackTimer.current = null;
      }
    };
  }, [deviceLocation, locationError, locating]);

  const handleLogout = () => {
    toast.info(t.refreshingSession);
    setTimeout(() => window.location.reload(), 800);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen bg-background p-4 pb-24 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.myProfile}</h1>
          <p className="text-sm text-muted-foreground">{t.manageInfo}</p>
        </div>
      </div>

      {!username && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/25 rounded-lg p-3 text-xs text-yellow-300">
          {t.noPiAccountWarning}
        </div>
      )}

      {/* Profile Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t.contracts}</p>
            <p className="text-2xl font-bold text-foreground">{contractsCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t.favorites}</p>
            <p className="text-2xl font-bold text-foreground">{favorites.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle>{t.personalInformation}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.fullName}
            </label>
            <Input
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder={t.enterFullName}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {t.email}
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="example@email.com"
              />
              {profile.email && (
                emailVerified && profile.email === verifiedEmail ? (
                  <p className="mt-1.5 text-xs text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'موثّق' : 'Verified'}
                  </p>
                ) : otpStage === 'idle' ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || !username}
                    className="mt-1.5 text-xs font-medium text-accent hover:opacity-80 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {otpSending
                      ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                      : (language === 'ar' ? 'إرسال كود التحقق' : 'Send verification code')}
                  </button>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder={language === 'ar' ? 'الكود المكوّن من 6 أرقام' : '6-digit code'}
                      className="bg-background border-border text-foreground text-sm h-9"
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otpCode.length !== 6}
                      className="shrink-0 text-xs font-medium bg-accent text-accent-foreground px-3 h-9 rounded-lg disabled:opacity-50"
                    >
                      {otpVerifying
                        ? (language === 'ar' ? '...' : '...')
                        : (language === 'ar' ? 'تأكيد' : 'Verify')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending}
                      className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {language === 'ar' ? 'إعادة إرسال' : 'Resend'}
                    </button>
                  </div>
                )
              )}
              {otpNote && <p className="mt-1 text-xs text-red-400">{otpNote}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> {t.phone}
              </label>
              <div className="flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => handleDialCodeChange(e.target.value)}
                  className="bg-background border border-border text-foreground rounded-md px-2 text-sm w-24 shrink-0"
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.flag} {d.code}
                    </option>
                  ))}
                </select>
                <Input
                  value={localPhone}
                  onChange={(e) => handleLocalPhoneChange(e.target.value.replace(/[^\d]/g, ''))}
                  className="bg-background border-border text-foreground"
                  placeholder="1XX XXX XXXX"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {t.location}
            </label>
            <div className="flex gap-2">
              <Input
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder={t.cityCountry}
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                title={language === 'ar' ? 'استخدم موقعي الحالي' : 'Use my current location'}
                className="shrink-0 flex items-center gap-1 text-xs font-medium bg-muted border border-border text-foreground px-3 rounded-md hover:border-accent transition disabled:opacity-50"
              >
                {locating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Crosshair className="w-3.5 h-3.5" />}
                {language === 'ar' ? 'موقعي الحالي' : 'Current location'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.bio}
            </label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="bg-background border-border text-foreground min-h-24"
              placeholder={t.tellUsAboutYourself}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle>{t.businessInformation}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.companyName}
            </label>
            <Input
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder={t.yourCompanyName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.websiteUrl}
            </label>
            <Input
              value={profile.websiteUrl}
              onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder="https://example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle>{t.socialMedia}</CardTitle>
          <CardDescription>{t.linkAccountsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <FacebookIcon className="w-4 h-4" /> Facebook
            </label>
            <Input
              value={profile.facebookUrl}
              onChange={(e) => setProfile({ ...profile, facebookUrl: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <TwitterIcon className="w-4 h-4" /> Twitter / X
            </label>
            <Input
              value={profile.twitterUrl}
              onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder="https://x.com/yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <InstagramIcon className="w-4 h-4" /> Instagram
            </label>
            <Input
              value={profile.instagramUrl}
              onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{t.accountActions}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? t.saving : t.saveChanges}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-border hover:bg-destructive/10 text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t.logout}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => { window.location.href = '/privacy'; }}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t.privacyPolicy}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => { window.location.href = '/terms'; }}
          >
            <ScrollText className="w-4 h-4 mr-2" />
            {t.termsOfService}
          </Button>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>RE Platform v1.0.0</p>
        <p>{t.allRightsReserved}</p>
      </div>
    </div>
  );
}
