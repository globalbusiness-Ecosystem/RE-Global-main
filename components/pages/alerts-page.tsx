'use client';

import { Bell, X, CheckCircle, AlertCircle, Zap, Home } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AlertsPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
}

export default function AlertsPage({ language, onBack }: AlertsPageProps) {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      titleEn: 'New Listing Match',
      titleAr: 'قائمة جديدة مطابقة',
      descriptionEn: 'New luxury apartment in Downtown Cairo matching your criteria',
      descriptionAr: 'شقة فاخرة جديدة في وسط القاهرة تطابق معاييرك',
      type: 'new-listing',
      icon: Home,
      price: '450π',
      time: '1 hour ago',
      timeAr: 'قبل ساعة',
      unread: true,
    },
    {
      id: 2,
      titleEn: 'Price Drop Alert',
      titleAr: 'تنبيه انخفاض السعر',
      descriptionEn: 'Your favorite property dropped by 15%',
      descriptionAr: 'انخفض السعر بنسبة 15% للعقار المفضل لديك',
      type: 'price-drop',
      icon: AlertCircle,
      price: '320π → 272π',
      time: '3 hours ago',
      timeAr: 'قبل 3 ساعات',
      unread: true,
    },
    {
      id: 3,
      titleEn: 'Offer Received',
      titleAr: 'تم استقبال عرض',
      descriptionEn: 'Agent interested in your property inquiry',
      descriptionAr: 'وكيل مهتم برغبتك في العقار',
      type: 'offer',
      icon: CheckCircle,
      time: '5 hours ago',
      timeAr: 'قبل 5 ساعات',
      unread: false,
    },
    {
      id: 4,
      titleEn: 'Trending Location',
      titleAr: 'موقع يكتسب شهرة',
      descriptionEn: 'Sheikh Zayed City is trending with 24% growth',
      descriptionAr: 'مدينة الشيخ زايد تكتسب شهرة برواج 24%',
      type: 'trending',
      icon: Zap,
      time: '1 day ago',
      timeAr: 'منذ يوم',
      unread: false,
    },
  ]);

  const handleDismiss = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const handleMarkAsRead = (id: number) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, unread: false } : alert
      )
    );
  };

  const unreadCount = alerts.filter((a) => a.unread).length;

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'new-listing':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'price-drop':
        return 'border-green-500/30 bg-green-500/5';
      case 'offer':
        return 'border-accent/30 bg-accent/5';
      case 'trending':
        return 'border-purple-500/30 bg-purple-500/5';
      default:
        return 'border-border bg-card';
    }
  };

  const getAlertIconColor = (type: string) => {
    switch (type) {
      case 'new-listing':
        return 'text-blue-500';
      case 'price-drop':
        return 'text-green-500';
      case 'offer':
        return 'text-accent';
      case 'trending':
        return 'text-purple-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <main className="w-full min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-accent">
                {language === 'en' ? 'Alerts' : 'التنبيهات'}
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'en'
                    ? `${unreadCount} new alert${unreadCount !== 1 ? 's' : ''}`
                    : `${unreadCount} تنبيهات جديدة`}
                </p>
              )}
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-accent" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        {alerts.length === 0 ? (
          <Card className="bg-card border border-border p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {language === 'en' ? 'No alerts at this time' : 'لا توجد تنبيهات في الوقت الحالي'}
            </p>
          </Card>
        ) : (
          alerts.map((alert) => {
            const AlertIcon = alert.icon;
            return (
              <Card
                key={alert.id}
                className={`border transition-all ${getAlertColor(
                  alert.type
                )} p-4 ${alert.unread ? 'ring-1 ring-accent/50' : ''}`}
              >
                <div className="flex gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${getAlertColor(
                      alert.type
                    )}`}
                  >
                    <AlertIcon
                      className={`w-5 h-5 ${getAlertIconColor(alert.type)}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      {language === 'en' ? alert.titleEn : alert.titleAr}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'en' ? alert.descriptionEn : alert.descriptionAr}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="text-muted-foreground hover:text-foreground transition flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.price && (
                      <span className="text-sm font-semibold text-accent">
                        {alert.price}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {language === 'en' ? alert.time : alert.timeAr}
                    </span>
                  </div>
                  {alert.unread && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="text-xs font-medium text-accent hover:text-accent/80 transition"
                    >
                      {language === 'en' ? 'Mark as read' : 'وضع علامة مقروء'}
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Alert Settings */}
      {alerts.length > 0 && (
        <div className="px-4 py-6 max-w-md mx-auto border-t border-border mt-4">
          <Button variant="outline" className="w-full border-border">
            {language === 'en' ? 'Manage Alert Settings' : 'إدارة إعدادات التنبيهات'}
          </Button>
        </div>
      )}
    </main>
  );
}
