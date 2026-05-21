'use client';

import { useState } from 'react';
import { Lock, ExternalLink, Mail, MessageCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsPageProps {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  onWhitePaperClick?: () => void;
  onBack?: () => void;
}

export default function SettingsPage({
  language,
  setLanguage,
  onWhitePaperClick,
  onBack,
}: SettingsPageProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');

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
      alert(language === 'en' ? 'Admin access granted' : 'تم منح الوصول الإداري');
      setShowAdminPanel(false);
    } else {
      setPinError(language === 'en' ? 'Invalid PIN' : 'رمز PIN غير صحيح');
    }
  };

  return (
    <main className="px-4 py-6 max-w-md mx-auto pb-24 space-y-4">
      {/* Header with Back Arrow */}
      <div className="flex items-center justify-between mb-6 -mx-4 px-4">
        <button
          onClick={onBack}
          className="p-1 hover:opacity-70 transition text-accent"
          title={language === 'en' ? 'Back to Home' : 'العودة للصفحة الرئيسية'}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-accent flex-1 text-center">
          {language === 'en' ? 'Settings' : 'الإعدادات'}
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
          {language === 'en' ? 'Language' : 'اللغة'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              language === 'en'
                ? 'bg-accent text-accent-foreground'
                : 'border border-border text-foreground hover:border-accent'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              language === 'ar'
                ? 'bg-accent text-accent-foreground'
                : 'border border-border text-foreground hover:border-accent'
            }`}
          >
            العربية
          </button>
        </div>
      </div>

      {/* 2. Dark Mode */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              {language === 'en' ? 'Dark Mode' : 'الوضع الليلي'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'en' ? 'Luxury dark theme' : 'مظهر مظلم فاخر'}
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
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
              {language === 'en' ? 'Notifications' : 'الإخطارات'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'en'
                ? 'Property & market alerts'
                : 'تنبيهات العقارات والسوق'}
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
          {language === 'en' ? 'RE Token' : 'رمز RE'}
        </h3>
        <div className="space-y-3 mb-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">
              {language === 'en' ? 'Token Price' : 'سعر الرمز'}
            </p>
            <p className="text-lg font-bold text-accent">1 $RE = 0.01π</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">
              {language === 'en' ? 'Total Supply' : 'الإمداد الكلي'}
            </p>
            <p className="text-lg font-bold text-accent">100M $RE</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">
              {language === 'en' ? 'How to Earn' : 'كيفية الكسب'}
            </p>
            <ul className="text-xs text-foreground space-y-1">
              <li>• {language === 'en' ? 'Buy properties' : 'شراء العقارات'}</li>
              <li>• {language === 'en' ? 'Invest in tokenized assets' : 'الاستثمار في الأصول الرمزية'}</li>
              <li>• {language === 'en' ? 'Refer friends' : 'اطلب من الأصدقاء'}</li>
            </ul>
          </div>
        </div>
        <button className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition">
          {language === 'en' ? 'Buy $RE' : 'اشتر $RE'}
        </button>
      </div>

      {/* 5. White Paper */}
      <div className="bg-card border border-border rounded-lg p-4">
        <button
          onClick={onWhitePaperClick}
          className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition rounded-lg"
        >
          <h3 className="font-semibold text-foreground">
            {language === 'en' ? 'White Paper' : 'الورقة البيضاء'}
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
              {language === 'en' ? 'Admin Panel' : 'لوحة التحكم'}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {language === 'en'
              ? 'Enter PIN from Google Sheets'
              : 'أدخل رمز PIN من Google Sheets'}
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
            {language === 'en' ? 'Unlock Admin' : 'فتح لوحة التحكم'}
          </button>
        </div>
      )}

      {/* 7. Contact Us */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-3">
          {language === 'en' ? 'Contact Us' : 'اتصل بنا'}
        </h3>
        <div className="space-y-3">
          <a
            href="mailto:globalbusiness435@gmail.com"
            className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-accent/50 hover:bg-accent/5 transition cursor-pointer group"
          >
            <Mail className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'Email' : 'بريد إلكتروني'}
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
                {language === 'en' ? 'WhatsApp' : 'واتساب'}
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
                {language === 'en' ? 'Instagram' : 'إنستاجرام'}
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
          {language === 'en' ? 'About RE Platform' : 'حول منصة RE'}
        </h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>RE Platform v1.0.0</p>
          <p>{language === 'en' ? 'Powered by Pi Network' : 'مدعوم من قبل شبكة Pi'}</p>
          <p>© GlobalBusiness</p>
        </div>
      </div>
    </main>
  );
}
