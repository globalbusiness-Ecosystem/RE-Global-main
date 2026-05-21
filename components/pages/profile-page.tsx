'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, LogOut, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePageProps {
  language: 'en' | 'ar';
  userId?: string;
  onBack?: () => void;
}

export default function ProfilePage({ language = 'en', userId = 'user_123', onBack }: ProfilePageProps) {
  const isArabic = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Ahmed Al-Mansouri',
    email: 'ahmed@globalbusiness.com',
    phone: '+201010810558',
    location: 'Cairo, Egypt',
    bio: 'Real estate investor and property developer',
    companyName: 'Global Business',
    websiteUrl: 'https://globalbusiness.com',
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Save to database
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(isArabic ? 'تم حفظ الملف الشخصي' : 'Profile saved successfully');
    } catch (error) {
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full min-h-screen bg-background p-4 pb-24 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
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

      {/* Profile Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{isArabic ? 'الخصائص' : 'Properties'}</p>
            <p className="text-2xl font-bold text-foreground">24</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{isArabic ? 'المفضلة' : 'Favorites'}</p>
            <p className="text-2xl font-bold text-foreground">12</p>
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

      {/* Account Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{isArabic ? 'إجراءات الحساب' : 'Account Actions'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ التغييرات' : 'Save Changes')}
          </Button>

          <Button
            variant="outline"
            className="w-full border-border hover:bg-destructive/10 text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isArabic ? 'تسجيل الخروج' : 'Logout'}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
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
