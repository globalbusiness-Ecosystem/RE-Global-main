'use client';

import { BarChart3, TrendingUp, Home, Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DashboardPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
}

export default function DashboardPage({ language, onBack }: DashboardPageProps) {
  const stats = [
    {
      labelEn: 'Properties Viewed',
      labelAr: 'العقارات المعروضة',
      value: '24',
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
    },
    {
      labelEn: 'Favorites Saved',
      labelAr: 'المفضلات المحفوظة',
      value: '8',
      icon: Home,
      color: 'from-accent to-amber-500',
    },
    {
      labelEn: 'Portfolio Value',
      labelAr: 'قيمة المحفظة',
      value: '2.4π',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
  ];

  const recentActivity = [
    {
      titleEn: 'Viewed Luxury Penthouse',
      titleAr: 'شقة فاخرة - بنتهاوس',
      timeEn: '2 hours ago',
      timeAr: 'قبل ساعتين',
      location: 'Downtown Cairo',
      price: '450π',
    },
    {
      titleEn: 'Added to Favorites',
      titleAr: 'تم الإضافة للمفضلات',
      timeEn: '5 hours ago',
      timeAr: 'قبل 5 ساعات',
      location: 'Sheikh Zayed City',
      price: '180π',
    },
    {
      titleEn: 'Inquiry Sent',
      titleAr: 'تم إرسال الاستفسار',
      timeEn: '1 day ago',
      timeAr: 'منذ يوم',
      location: 'New Cairo',
      price: '320π',
    },
  ];

  const quickActions = [
    { labelEn: 'Search Properties', labelAr: 'البحث عن عقارات', pageId: 'home' },
    { labelEn: 'View Favorites', labelAr: 'عرض المفضلات', pageId: 'favorites' },
    { labelEn: 'Check Alerts', labelAr: 'تحقق من التنبيهات', pageId: 'alerts' },
    { labelEn: 'Browse Map', labelAr: 'استعرض الخريطة', pageId: 'map' },
  ];

  const handleQuickAction = (pageId: string) => {
    const event = new CustomEvent('navigateToPage', { detail: pageId });
    window.dispatchEvent(event);
  };

  return (
    <main className="w-full min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-accent">
            {language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'en' ? 'Welcome back!' : 'أهلا وسهلا بعودتك!'}
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="bg-card border border-border p-4 hover:border-accent/50 transition"
              >
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg w-fit mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-accent mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? stat.labelEn : stat.labelAr}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                onClick={() => handleQuickAction(action.pageId)}
                variant="outline"
                className="h-auto py-4 border-border hover:bg-card hover:border-accent/50 transition"
              >
                <span className="text-center text-sm font-medium">
                  {language === 'en' ? action.labelEn : action.labelAr}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              {language === 'en' ? 'Recent Activity' : 'النشاط الأخير'}
            </h2>
            <button className="text-accent hover:text-accent/80 text-sm flex items-center gap-1">
              {language === 'en' ? 'View All' : 'عرض الكل'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <Card key={idx} className="bg-card border border-border p-4 hover:border-accent/50 transition cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">
                      {language === 'en' ? activity.titleEn : activity.titleAr}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-accent font-bold text-sm">{activity.price}</div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? activity.timeEn : activity.timeAr}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Portfolio Section */}
        <Card className="bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 p-6">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-6 h-6 text-accent" />
            <h3 className="font-semibold text-foreground">
              {language === 'en' ? 'Your Portfolio' : 'محفظتك'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'en'
              ? 'Track your real estate investments and earnings'
              : 'تابع استثماراتك العقارية وأرباحك'}
          </p>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {language === 'en' ? 'View Portfolio' : 'عرض المحفظة'}
          </Button>
        </Card>
      </div>
    </main>
  );
}
