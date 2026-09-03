'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, LogOut, Phone, Mail, MapPin, FileText, ScrollText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useFirebaseDatabase } from '@/lib/firebase-database';

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

export default function ProfilePage({ language = 'en', favorites = [], onBack }: ProfilePageProps) {
  const isArabic = language === 'ar';
  const { username } = usePiAuth();
  const { getProfile, saveProfile, getContractsForUser } = useFirebaseDatabase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [contractsCount, setContractsCount] = useState(0);

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
      }
      setContractsCount(contracts.length);
      setLoading(false);
    });
  }, [username]);

  const handleSaveProfile = async () => {
    if (!username) {
      toast.error(isArabic ? 'يجب تسجيل الدخول عبر Pi أولاً' : 'You need to sign in with Pi first');
      return;
    }
    setSaving(true);
    try {
      const ok = await saveProfile(username, profile);
      if (ok) {
        toast.success(isArabic ? 'تم حفظ الملف الشخصي' : 'Profile saved successfully');
      } else {
        toast.error(isArabic ? 'خطأ في الحفظ' : 'Error saving profile');
      }
    } catch (error) {
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    toast.info(isArabic ? 'جاري تحديث الجلسة...' : 'Refreshing session...');
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
    <div className={`w-full min-h-screen bg-background p-4 pb-24 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isArabic ? 'الملف الشخصي' : 'My Profile'}</h1>
          <p className="text-sm text-muted-foreground">{isArabic ? 'إدارة معلوماتك الشخصية' : 'Manage your information'}</p>
        </div>
      </div>

      {!username && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/25 rounded-lg p-3 text-xs text-yellow-300">
          {isArabic
            ? 'مش شايفين حساب Pi متصل — لن يتم حفظ بياناتك حتى تسجل الدخول.'
            : "No connected Pi account detected — your info won't be saved until you sign in."}
        </div>
      )}

      {/* Profile Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{isArabic ? 'عقودي' : 'Contracts'}</p>
            <p className="text-2xl font-bold text-foreground">{contractsCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{isArabic ? 'المفضلة' : 'Favorites'}</p>
            <p className="text-2xl font-bold text-foreground">{favorites.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle>{isArabic ? 'المعلومات الشخصية' : 'Personal Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {isArabic ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <Input
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {isArabic ? 'البريد' : 'Email'}
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> {isArabic ? 'الهاتف' : 'Phone'}
              </label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="+20 1XX XXX XXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {isArabic ? 'الموقع' : 'Location'}
            </label>
            <Input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder={isArabic ? 'المدينة والدولة' : 'City, Country'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {isArabic ? 'السيرة الذاتية' : 'Bio'}
            </label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="bg-background border-border text-foreground min-h-24"
              placeholder={isArabic ? 'اكتب عن نفسك' : 'Tell us about yourself'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle>{isArabic ? 'معلومات العمل' : 'Business Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {isArabic ? 'اسم الشركة' : 'Company Name'}
            </label>
            <Input
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder={isArabic ? 'اسم شركتك' : 'Your company name'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {isArabic ? 'موقع الويب' : 'Website URL'}
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
          <CardTitle>{isArabic ? 'التواصل الاجتماعي' : 'Social Media'}</CardTitle>
          <CardDescription>
            {isArabic ? 'اربط حساباتك ليراها الآخرون في ملفك العام' : 'Link your accounts to show on your public profile'}
          </CardDescription>
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
          <CardTitle>{isArabic ? 'إجراءات الحساب' : 'Account Actions'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ التغييرات' : 'Save Changes')}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-border hover:bg-destructive/10 text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isArabic ? 'تسجيل الخروج' : 'Logout'}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => { window.location.href = '/privacy'; }}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => { window.location.href = '/terms'; }}
          >
            <ScrollText className="w-4 h-4 mr-2" />
            {isArabic ? 'شروط الخدمة' : 'Terms of Service'}
          </Button>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>RE Platform v1.0.0</p>
        <p>{isArabic ? 'جميع الحقوق محفوظة © 2026' : 'All rights reserved © 2026'}</p>
      </div>
    </div>
  );
}
